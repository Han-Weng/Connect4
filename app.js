var express = require('express');
var bodyParser = require('body-parser');
var ejs = require("ejs");
var urlencoderParser = bodyParser.urlencoded({ extended: false});
var meme = require("./js/meme.js");
const { winnerAlgorithm} =require('./js/connect4.js');

 var app = express();
 var http = require('http').createServer(app);
 var fs = require('fs');

 var rawdata = fs.readFileSync('./data/data.json');
 var rawgame = fs.readFileSync('./data/game.json');

 var data = JSON.parse(rawdata);
 var game = JSON.parse(rawgame);
 let names = [];
fs.readFile('data/data.json', 'utf8', function(err, contents) {
  if(err){
    console.log("Couldnt read names file");
    return;
  }
  for (var i = 0; i < data.length; i++){
    names.push(data[i].name)
  }
  console.log(names);
});
 var session = require("express-session")({
  secret: "my-secret",
  maxAge: 24 * 60 * 60 * 1000 
});
//some files exported so I wouldn't have too many lines of code but in the end, i just wrote more 
//and didn't plan everything out 
const {    draw,archive,creategame,chat,quit, input   }  = require("./js/game.js")
const{logout, matchGame, searchForUser, loginUser,createUser} =
require("./js/users.js");
const {watchgame,next}  = require("./js/history.js");
const {removeFriend,requestResponse,friendRequest,viewFriend,isFriend} = require("./js/friends.js");

http.listen(5000, () => {
  console.log('listening on *:8080'); 
}); 

const Piece = require('./js/piece.js');


app.use(session ) 
const io = require('socket.io')(http );
var view = [];
io.use(function(socket, next) { 
  session(socket.request, socket.request.res || {}, next);
});  
// io.emit('observers', data={observers:"map"} );

io.on('connection', socket => {
  console.log('connect=====');
  if (!view.includes(socket.request.session.name)){
    view.push(socket.request.session.name)
  }
    socket.emit('hello', view );
  
  socket.on('disconnect', () => {
    const index = view.indexOf(socket.request.session.name);
    if (index > -1) {
      view.splice(index, 1);
    }
    console.log('user disconnected'+ socket.request.session.name);
  });
 
});
app.set('view engine', 'ejs');

app.use(express.static( './js'));
app.use(express.json())
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({extended: true}));
// each of the post request have a function tied to their response, they handle
//post requests from each page
app.post('/login', loginUser)
app.post('/register', createUser)
app.post('/input', input)
app.post('/chat', chat)

//userPage post, this will be where the user page post is
app.post("/logout",logout);
app.post("/creategame",creategame);
app.post("/search", searchForUser);
app.post("/requestResponse", requestResponse);
app.post("/removeFriend",removeFriend);
 //these 2 are used in viewuser and userpage, playgame allows you to view or play game
 //watch game dirtects you to one of their pass games or current games to view pass results
app.post("/playgame",playgame);
app.post("/watchgame",watchgame);   
//viewUser viewing other userse
app.post("/viewFriend", viewFriend);
//game
app.post("/quit", quit);
friendRequest
app.post("/friendRequest", friendRequest);

//game 
//history 
app.post('/next', next);
app.post('/privacy', privacy);
 
app.get('/friendProfile', searchForUser);
app.get('/chess',  async function(req,res){
  //const {load }  = require("./js/game.js")
if(req.method ==='GET'){ 
    res.render('chessboard' )
}});

//here are the links for where to go for each route
app.get('/login', async function(req,res){
   var meme = require("./js/meme.js");

  var send = await meme.load() 

if(req.method ==='GET'){ 
  console.log(send )

    res.render('login', {meme:send })
}});
app.get('/', async function(req,res){
  res.render( "index");
});
app.get('/404', async function(req,res){
  res.render( "404");
});
app.get("/game/", async function(req, res, next){
//print the list of available games to view
  var viewGame = [];
  var type = "game"
  console.log("view game is "+viewGame);
  console.log("view game is "+game.length);

  for (var i=0; i<game.length; i++){
    var string = "";

    if (game[i].status == "public"){
      string = "game/"+game[i].id
      viewGame.push(string)

    } else if((game[i].status == "friends-only")&&((isFriend(game[i].yellow[0], req.session.name)==true)||(isFriend(game[i].red[0], req.session.name)==true))){
      string = "game/"+game[i].id
      viewGame.push(string)
    }else if((game[i].yellow[0] ==req.session.name)||(game[i].red[0] ==req.session.name)){
      string = "game/"+game[i].id
      viewGame.push(string)
    }
  }
  console.log("view game is "+viewGame);

        res.render('search', {
         data :  viewGame, type:type} )
      return 0;
}) 
app.get("/users/",async function(req, res, next){
  //print the list of available users to see
  var type = "users"
  var viewUsers = [];
  var string = "";
  for (var i=0; i<data.length; i++){
    if (data[i].public == "public"){
      string = "users/"+data[i].name
      viewUsers.push(string)
    } else if((data[i].public == "private")&&(isFriend( data[i].name, req.session.name)==true)){
      string = "users/"+data[i].name
      viewUsers.push(string)
    }
  }
  console.log(viewUsers);
        res.render('search', {
         data :  viewUsers, type:type})
      return 0;
})  
app.get("/users/:uid",async function(req, res, next){
  //return a player id
  if (doesExist(req.params.uid)==false){
    res.redirect("/404");
    return 0;
  } 
  var user_games =  doesExist(req.params.uid)

  var views = [];
   console.log("Getting user with name: " + req.params.uid);
   //return the active games in the user page that are allowed
   for (var i; i <user_games.gameID.length; i++){
    var map = findGamid(user_games.gameID[i])
    if (map.status=="friends only"){
      if (isFriend(req.session.name,req.params.uid)!= false){
        views.push(map.id);
      }
    }else if (map.status=="public"){
      views.push(map.id);
    }else if ((map.status=="private")){
      if ((req.session.name == map.red[0])||(req.session.name == map.yellow[0])){
        views.push(map.id);
      }
    }  
  }
  res.render('viewUser', {data : doesExist(req.params.uid), views: views})

});
app.get("/game/:uid", async function(req, res, next){
  var game = findGamid(req.params.uid);
//return the game id of a particular game
  if (findGamid(req.params.uid)==false){
     res.redirect("/404");
    return 0;
  } 
   observers = findGamid((req.params.uid)).observers;
   req.session.map = req.params.uid;
         res.render('game', {
          data : findGamid(req.params.uid).connect4,
          chat : findGamid(req.params.uid).chat,
          id : findGamid(req.params.uid).id,
          winner : findGamid(req.params.uid).winner,
          observer : findGamid(req.params.uid).observers,
          game : findGamid(req.params.uid),
          turn : findGamid(req.params.uid).turn,
          yellowPlayer: findGamid(req.params.uid).yellow,
           redPlayer: findGamid(req.params.uid).red})
       return 0;
}) 

app.get("/games/", async function(req, res, next){
  //same thing as /game, I realized i had to do /games so i rewrote everything
  var game = req.params.uid;
  var views = [];
  var type = "game"
  //the if statements account for cases depending on what the query strings request
   if  ((req.query.name != undefined)&&(req.query.active == undefined)){
    views = findUserGames(req.query.name);
  }else if ((req.query.name == undefined)&&(req.query.active != undefined)){
    if ((req.query.active =="true")||(req.query.active =="false")){
    views = findDoneGames(req.query.active);
    console.log("Gettin g user with name: " +views);
  }
  }else if ((req.query.name == undefined)&&(req.query.active == undefined)){
    views = allGames()
  }else if ((req.query.name != undefined)&&(req.query.active != undefined)){
    views = userAndDone(req.query.name ,req.query.active );
  }
console.log(req.query.detail+"req.query.detail")
var players = [];
var winners = []
//this is for the summary if the players want to see the replay of the game as well
  if (req.query.detail=="full"){
   var type = "game/";
    for (var i=0; i <views.length; i++){
      views[i] = views[i].replace("game/","watch/")
      console.log(views)
  }
}else {
    for (var i=0; i <views.length; i++){
      if  (findGamid(views[i].substring(5)).winner ==""){
        winners.push("Undecided")
      }else{
       var map = (findGamid(views[i].substring(5)) )
        var string  = map.winner + JSON.stringify(map.record )
        winners.push(string )
      }
      console.log(views[i].substring(5))
      string = findGamid(views[i].substring(5)).red + " "+ findGamid(views[i].substring(5)).yellow
      players.push(string);
  }
}
  res.render('search', { data :  views, type:type,winners:winners, players:players})
 return 0;
})

app.get("/watch/:uid", function(req, res, next){
  //if you wanna view how the play game is played out 
  if (findGamid(req.params.uid)==false){
    res.redirect("/404");
   return 0;
 } 
//  if (findGamid(req.params.uid).winner==""){
//   res.redirect("/404");
//  return 0;
// } 
     console.log("Getting user with name: " + (req.params.uid));
     res.render('history', {
      tape : findGamid(req.params.uid).tape,
      data : findGamid(req.params.uid).history,
      chat : findGamid(req.params.uid).chat,
      turn : findGamid(req.params.uid).turn,
      id : findGamid(req.params.uid).id,
      winner : findGamid(req.params.uid).winner,
      game : findGamid(req.params.uid),
      turn : findGamid(req.params.uid).turn,
      yellowPlayer: findGamid(req.params.uid).yellow,
      redPlayer: findGamid(req.params.uid).red})
   return 0;
  })
app.get('/userPage', function(req,res){
  //user page and displaying friends that are online or offline
  console.log("this is the issue "+(JSON.stringify(req.session)));
  friends = doesExist(req.session.name).friends
  name = doesExist(req.session.name)
  console.log("this is the name "+name);
  console.log("this is the name "+data);

  var status = []
  for (var i = 0; i < friends.length; i++) {
    if (doesExist(friends[i]).status == "online"){
      status.push("online");
    }else{
      status.push("offline");
    }
  }
  res.render("userPage", {data:doesExist(req.session.name), map:game, status: status, names:names});
  });
 function privacy(req,res){
     //if you wanna switch the privacy mode
    console.log(req.body);
    var name = doesExist(req.body.name);
    if (name.public == "public"){
      name.public = "private";
    }else if (name.public == "private"){
      name.public = "public";
    }
    res.redirect(req.get('referer'));;
    return 0;
  }

  function userAndDone(name,done){
    // search for a user and return what that games that guy played depending on the done var status
    var view  = [];
    console.log(name)
    console.log(game.length)
    var string = ""
    type = "game"
    for (var i=0; i <game.length; i++){
      var map = findGamid(game[i].id)
      if ((map.red[0]==name)||(map.yellow[0]==name)){
        if ((map.winner!="")&&( done == "true")){
          string = "game/"+game[i].id
          view.push(string);
        }
         else if ((map.winner=="")&&( done == "false")){
          string = "game/"+game[i].id
          view.push(string);
        }
      }  
    }
  
    return view;
  
  }
  function findUserGames(name){
    //if done var isnt specified
    var view  = [];
    console.log(name)
    console.log(game.length)
    var string = ""
    type = "game"
    for (var i=0; i <game.length; i++){
      var map = findGamid(game[i].id)
      if (map.red[0]==name){
        string = "game/"+game[i].id
        view.push(string);
      }else if ((map.yellow[0]==name)){
        string = "game/"+game[i].id
        view.push(string);
      }  
    }
    return view;
  
  }
  function findDoneGames(done){
    //if the users var isnt in the query string and only done var is declared
    var view  = [];
    var string = ""
    type = "game"
    for (var i=0; i <game.length; i++){
      var map = findGamid(game[i].id)
      if ((map.winner!="")&&( done == "true")){
        string = "game/"+game[i].id
        view.push(string);
      } else if((map.winner=="")&&( done == "false")){
        string = "game/"+game[i].id
        view.push(string);
      } 
    }
    return view;
  }
  function allGames( ){
    //find all the games
    var viewGame = [];
    console.log("Getting user with name: " +game.length);
    var string = "";
    for (var i=0; i<game.length; i++){
      console.log("Getting user with name: " +game[i].id);
      string = "game/"+game[i].id
      viewGame.push(string)
    }
    return viewGame;
  
  }
function findGamid(name){
  //find a specific game
  for(var i = 0; i <  game.length; i++){
    if(game[i].id ==name ){
      return game[i];
    }
 }
 return 0;
}
function playgame(req, res){
  //here if someone wants to watch a game they will be direct to a game with that
//specifc req id

   console.log(req.body)
   for(var i = 0; i <  game.length; i++){
     if(parseInt(req.body.name) ==game[i].id ){
        console.log("this is the req.body.name ",  game[i])
       res.redirect("/game/" +game[i].id);
       return 0;
     }
  }
  console.log("data is ....", req.body)
}
 
