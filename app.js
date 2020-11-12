const express = require('express');
var bodyParser = require('body-parser');
const ejs = require("ejs");
const session = require('express-session')
var urlencoderParser = bodyParser.urlencoded({ extended: false});
 const app = express();
 app.use(session({  secret: 'some secret here', maxAge: 24 * 60 * 60 * 1000  }))

  let gameBoard=[ ]
  let xLength = 7
  let yLength = 6

  for (var i = 0; i < yLength; i++) {
          gameBoard.push([])
          for (var j = 0; j < xLength; j++) {
            gameBoard[i][j] = "white"
          }
  }

 const fs = require('fs');

 let rawdata = fs.readFileSync('data.json');
 let data = JSON.parse(rawdata);
 // console.log(data);
 // console.log("hello");

 app.set('view engine', 'ejs');
 app.use(express.static( './js'));
app.use(express.json())
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({extended: true}));

app.post("/viewUser", searchForUser);
app.get('/login', createUser)
app.post('/login', createUser)
app.post("/search", searchForUser);

app.post("/friendRequest", friendRequest);
app.post("/requestResponse", requestResponse);
app.post("/input", input);
app.post("/removeFriend",removeFriend);
app.post("/playgame",playgame);
app.get('/', function(req,res){
  res.render( "index");
});
app.use("/login", function(req, res){
  console.log(req.session.name);

  console.log("Request from user: " + req.session);
});


app.get('/userPage', function(req,res){
  console.log("this is the issue "+(JSON.stringify(req.session)));
  console.log("this is the name "+(JSON.stringify(req.session.name)).toLowerCase());
  res.render("userPage", {data:doesExist(req.session.name)});
});

app.get("/users/:uid", function(req, res, next){
   console.log("Getting user with name: " + req.params.uid);
   doesExist(req.params.uid)
   	res.render('viewUser', {data : doesExist(req.params.uid)})

})
app.get("/game/:uid", function(req, res, next){

  req.session.ass= 6

   console.log("Getting user with name: " + req.params.uid);
   doesExist(req.params.uid)

   for(var i = 0; i <  doesExist(req.params.uid).games_active.length; i++){
     if(doesExist(req.params.uid).games_active[i].name ==req.session.name ){
       console.log("doesExist(req.params.uid).games_active[i].name ",  doesExist(req.params.uid).games_active[i].name)
       console.log("req.session.name ",  req.session.name)
        res.render('game', {
          data : doesExist(req.params.uid).games_active[i].connect4,
          yellowPlayer: req.session.name,
           redPlayer:doesExist(req.params.uid).name})

       return 0;
     }
  }


})
function playgame(req, res){
  console.log(req.body.name)
   for(var i = 0; i <  doesExist(req.body.name).games_active.length; i++){
     if(doesExist(req.body.name).games_active[i].name ==req.session.name ){
        console.log("this is the req.body.name ",  games_active_array(req.body.name, req.session.name))
       res.redirect("/game/" + req.body.name);
       return 0;
     }
  }
  console.log("data is ....", req.body)
}

function input(req, res){
  var numbersOnly = (req.body.input).match(/[0-6]/);
    var length = ((req.body.input).length);
      var player =       games_active_array(req.body.array, req.session.name);
      console.log('player turn is on', player.turn)


      if ((numbersOnly == null)||(length >1)||((player.turn==0))){

        res.redirect(req.get('referer'));;
        return 0;
      }
      var map = games_active_array(req.body.array, req.session.name).connect4
      var colour = games_active_array(req.body.array, req.session.name).colour
       player.turn = 0;
       console.log('player turn is on', player.turn)

      for (var i = 5; i >= 0; i--) {
     	  if (map[i][req.body.input] == "white"){
    			map[i][req.body.input] = colour
          res.redirect(req.get('referer'));;
    			return 0
    		}
    	}
  res.redirect(req.get('referer'));;

}
function games_active_array(name, username){
  for(var i = 0; i <  doesExist(name).games_active.length; i++){
    if(doesExist(name).games_active[i].name ==username ){
      return doesExist(name).games_active[i];
    }
 }
 return 0;
}
function removeFriend(req, res){
  for(var i = 0; i < doesExist(req.session.name).friends.length; i++) {
  console.log(doesExist(req.session.name).friends[i])
     if ((req.body.name) == doesExist(req.session.name).friends[i]){
      doesExist(req.session.name).friends.splice(i,1);
      res.redirect(req.get('referer'));;
      return false;
    }
 }
}
function requestResponse(req, res){
  length = (JSON.stringify(req.body.name)).length
  response = JSON.stringify(req.body.name).substring(length-2,length-1)
  name = JSON.stringify(req.body.name).substring(1,length-2)
  console.log("this is the name "+name)
  console.log("this is the response "+response)

  for(var i = 0; i < doesExist(req.session.name).friend_request.length; i++) {
 	console.log(doesExist(req.session.name).friend_request[i])
  console.log(name)
    if ((name) == doesExist(req.session.name).friend_request[i]){
      console.log("bingbing")

      if (response == 'Y'){
        console.log(  doesExist(req.session.name).friends)
          doesExist(req.session.name).friends.push(name);
          console.log(  doesExist(req.session.name).friends)

      }
      doesExist(req.session.name).friend_request.splice(i,1);

      res.redirect(req.get('referer'));;

      return false;
    }
 }
 res.redirect(req.get('referer'));;

}
function friendRequest(req, res){
let body = req.body;
let sender =  (body.name)
let receiver =  (req.session.name)

for(var i = 0; i < doesExist(receiver).friend_request.length; i++) {
//	console.log( data[i].name)
  if ((sender) == doesExist(receiver).friend_request[i]){
    res.redirect(req.get('referer'));;
    return false;
  }
}
doesExist(receiver).friend_request.push(sender);
res.redirect(req.get('referer'));;
}
function searchForUser(req, res){
let body = req.body;
console.log("body of dat"+body.user);
data.forEach(d => {
  console.log("data os "+d.name);

	if ( d.name.toLowerCase() == body.user.toLowerCase()){
			console.log("found: " + d.name);
  res.redirect("/users/" + d.name);
//		res.render('viewUser', {data : d,})
		return true;
	}
});
}
function doesExist(newUser){
	for(var i = 0; i < data.length; i++) {
	//	console.log( data[i].name)
 		if (newUser.toLowerCase() === data[i].name.toLowerCase()){
			return data[i] ;
 		}
 }
	return false;
}
function createUser(req,res){
	if(req.method ==='GET'){
			res.render('login')
	}
	else if (req.method === 'POST'){
	let newUser  =  req.body;
  if(!newUser.name || !newUser.pw){
    return null;
  }
//	console.log(newUser)
req.session.name=  newUser.name
req.session.pw=  newUser.pw

console.log('username'+req.session.name)
console.log('password'+req.session.pw)
console.log('session '+req.session)

  if(  doesExist(newUser.name)){
		console.log('user does exist')
	//	console.log(doesExist(newUser))
		//res.render("userPage", {data: doesExist(newUser)});
    console.log('session does exist '+ (JSON.stringify(req.session)))

    res.redirect("userPage");
 		return null;
	}else{
//	console.log('user is working')

  newUser.games_played = '';
  newUser.games_active = '';
  newUser.friends = '';
  newUser.friend_request = '';
	newUser.win = 0;
	newUser.total = 0;
	data.push(newUser)

 	res.render("userPage", {data: newUser});
	}
 }
}
app.listen(8080, function () {
 });



















// Request that does not match api/ folder,
// Attempts to grab the html from views/pages/
// app.get(/^(?!\/api\/)/, (req, res) => {
//     let purl = url.parse(req.url, true);
//     let pathname = 'pages' + purl.pathname;
//
//     if ((pathname)[pathname.length - 1] === '/') {
//         pathname += 'index';
//     }
//     res.render(pathname, purl.query);
// });
