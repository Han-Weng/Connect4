var bodyParser = require('body-parser');
var fs = require('fs');
const { winnerAlgorithm} =require('./connect4.js');

 var rawdata = fs.readFileSync('./data/data.json');
 var rawgame = fs.readFileSync('./data/game.json');

 var data = JSON.parse(rawdata);
 var game = JSON.parse(rawgame);

function doesExist(newUser){
  //find a specific user
  console.log("data,length"+  data.length)

	for(var i = 0; i < data.length; i++) {
		console.log( data[i].name)
 		if (newUser.toLowerCase() === data[i].name.toLowerCase()){
      console.log("newuser"+ data[i].name.toLowerCase())

			return data[i] ;
 		}
 }
 console.log("doesn't exist");
	return false;
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


//logouts and reset the session or cookie
function logout(req,res){
    doesExist(req.session.name).status = "offline"
    req.session.name = "";
    req.session.pw=  "";
    res.redirect("/login")
  }
  function matchGame(newUser){
    //match user with a specific game type with new users 
    console.log("data,length"+  data.length)
  
      for(var i = 0; i < data.length; i++) {
          console.log( data[i].searchOpponent)
       if((newUser.toLowerCase() != data[i].name.toLowerCase())&&
       (doesExist(newUser).searchOpponent==data[i].searchOpponent)){
        console.log("newuser"+ data[i].name.toLowerCase())
        doesExist(newUser).searchOpponent="";
        data[i].searchOpponent=""
              return data[i] ;
           }
   }
   console.log("doesn't exist");
      return false;
  
  
  
  }
   
  function searchForUser(req, res){
    //the search bar for a user name idk why i didnt combine this with viewFriend function as well
  let body = req.body;
   console.log("the user name is =================================="+body.user)
  data.forEach(d => { 
    console.log("body of dat"+doesExist(d.name).public);
  
      if(d.name.toLowerCase() == body.user.toLowerCase()){
      if((doesExist(d.name).public == "private")&&((isFriend(req.session.name, body.user)!=false)))  {
        res.redirect("/users/" + d.name);
      }else if(doesExist(d.name).public == "public")  {
        res.redirect("/users/" + d.name);
      }else{
        res.redirect(req.get('referer'));
      }
      return true;
       }
    });
  
   }
  
 
  function loginUser(req,res){
  //log the user in 
      let newUser  =  req.body;
    if(!newUser.name || !newUser.pw){
      return null;
    }
  //	console.log(newUser)
  req.session.name=  newUser.name
  req.session.pw=  newUser.pw
  doesExist(req.session.name).status = "online"
  
  
  console.log('username'+req.session.name)
  console.log('password'+req.session.pw)
  console.log('session '+req.body)
    if(  doesExist(newUser.name)){
          console.log('user does exist')
      if (newUser.pw != doesExist(newUser.name).pw){
        res.redirect(req.get('referer'));
        return null;
      }
      res.redirect("userPage");
           return null;
      } 
    res.redirect("userPage");
  
       }
  function createUser(req,res){
  //for the regist form tag
      let newUser  =  req.body;
      if(!newUser.name || !newUser.pw){
        return null;
      }
  
    //	console.log(newUser)
    req.session.name=  newUser.name
    req.session.pw=  newUser.pw
    doesExist(req.session.name).status = "online"
    
    
    console.log('username'+req.session.name)
    console.log('password'+req.session.pw)
    console.log('session '+req.body)
    
      if(  doesExist(newUser.name)){
        console.log('user does exist')
   
        console.log('session does exist '+ (JSON.stringify(req.session)))
    
        res.redirect("userPage");
         return null;
      }else{
      console.log('user is working')
      newUser.gameID =[]
      newUser.status = "online"
      newUser.games_played = [];
      newUser.games_active = [];
      newUser.friends = [];
      newUser.public= "public";
      newUser.friend_request = [];
      newUser.win = 0;
      newUser.total = 0;
      data.push(newUser)
       res.render("userPage", {data: newUser});
      }
    
  } 
module.exports ={
    logout, matchGame, searchForUser, loginUser,createUser
}   