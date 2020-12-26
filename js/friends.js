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

function removeFriend(req, res){
    //to remove friends, a TA checkin 3 said there was a error bug but i was unable to find the said bug
    for(var i = 0; i < doesExist(req.session.name).friends.length; i++) {
    console.log(doesExist(req.session.name).friends[i])
        if ((req.body.name) == doesExist(req.session.name).friends[i]){
        doesExist(req.session.name).friends.splice(i,1);
       }
       for(var i = 0; i < doesExist(req.body.name).friends.length; i++) {
  
       if ((req.session.name) == doesExist(req.body.name).friends[i]){
        doesExist(req.body.name).friends.splice(i,1);
       }
      }
        res.redirect(req.get('referer'));;
        return false;
      
   }
}
function requestResponse(req, res){
//what to do with someone's request for a friend request
    length = (JSON.stringify(req.body.name)).length
    response = JSON.stringify(req.body.name).substring(length-2,length-1)
    name = JSON.stringify(req.body.name).substring(1,length-2)
    console.log("this is the naaaaaaaaame "+name)
    console.log("this is the response "+response)

    for(var i = 0; i < doesExist(req.session.name).friend_request.length; i++) {
        console.log(doesExist(req.session.name).friend_request[i])
    console.log(name)
        if ((name) == doesExist(req.session.name).friend_request[i]){
        console.log("bingbing")
        if (response == 'Y'){
            doesExist(req.session.name).friends.push(name);
            doesExist(name).friends.push(req.session.name);
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
//send the friend request 
    let body = req.body;
    let sender =  (body.name)
    let receiver =  (req.session.name)

    if (req.session.name == sender){
    res.redirect(req.get('referer'));;
    return false;
    }

    console.log("list friend is:"+ doesExist(receiver).friend_request.length)
    //check if the receiver has the person as a friend
    for(var i = 0; i < doesExist(receiver).friend_request.length; i++) {

        console.log("friend is:"+ doesExist(receiver).friend_request[i])
        if ((sender == doesExist(receiver).friend_request[i])){
            res.redirect(req.get('referer'));;
            return false;
        }
    }
    //check if the sender has the person as friend
    for(var i = 0; i < doesExist(sender).friend_request.length; i++) {
        if ((receiver== doesExist(sender).friend_request[i])){
        res.redirect(req.get('referer'));;
        return false;
        }
    }
    console.log("sended",sender);
    doesExist(sender).friend_request.push(receiver);  

    console.log("doesExist(receiver).friend_request.push(sender); ",doesExist(sender).friend_request)

    res.redirect(req.get('referer'));;
}
function viewFriend(req, res){
//viewing a freidn page
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

function isFriend(newUser, friend){
//check if 2 guys are friends
    console.log("yoffffffffffffffs" )

        user = doesExist(newUser);
        for(var i = 0; i < user.friends.length; i++) {
            //console.log(user.friends[i])
            if (friend.toLowerCase() === user.friends[i].toLowerCase()){
        console.log("your friend is"+user.friends[i].toLowerCase())
                return data[i] ;
            }
    }
    console.log("not friends ");
        return false;
}
module.exports ={
    removeFriend,requestResponse,friendRequest,viewFriend,isFriend
}   