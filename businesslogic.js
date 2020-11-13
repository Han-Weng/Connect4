let data = [
	{name: "Jonathon",pw:"123", games_played: ["Dio"], games_active:["dead"], wins:2, total:4, friends:["Zepplin"], friend_request:["noone"]},
  {name: "Joseph", pw:"123",  games_played: ["Kars"], games_active:["alive"], wins:5, total:6, friends:["Casear"], friend_request:["Jotaro"]},
	{name: "Jotaro", pw:"123",  games_played: ["Dio"], games_active:["alive"], wins:8, total:8, friends:["Polnareff"], friend_request[:"noone"]},

 ];
  //Helper function to verify a user object exists, has a username and that a user with that name exists
function isValidUser(user){
  if(!userObj.username){
    return false;
  }
  return true;
}


// renders the user oage if they exist
function searchForUser(req, res){
	let body = req.body;
	console.log(body);
	data.forEach(d => {
		if (d.name == body.user){
			console.log("found: " + d.name);
			res.render('viewUser', {data : d})
			return true;
		}
	});
}
//look for user if they exist or not
function doesExist(newUser){
	for(var i = 0; i < data.length; i++) {
	//	console.log( data[i].name)
 		if (newUser.name === data[i].name){
			return true;
 		}
 }
	return false;
}


// if someone wants to create a new user account
function createUser(req,res){

	if(req.method ==='GET'){
			res.render('login')
	}
	else if (req.method === 'POST'){
	let newUser  =  req.body;
  if(!newUser.name || !newUser.pw){
    return null;
  }

  if(  doesExist(newUser)){
		console.log('user does exist')
 		return null;
	}

  newUser.games_played = '';
  newUser.games_active = '';
  newUser.friends = '';
  newUser.friend_request = '';
	newUser.win = 0;
	newUser.total = 0;
	data.push(newUser)

 	res.render("viewUser", {data: newUser});
	}
 }

// friend request and stuff
function makeFriends(userA, userB){
   if(!users.hasOwnProperty(userA) && !users.hasOwnProperty(userB)){
    return;
  }
   if(users[userA].friends.includes(userB)){
    return;
  }
  users[userA].friends.push(userB);
  users[userB].friends.push(userA);
}


//creates a connect 4 game between 2 people
function createGame(requestingUser, requestingUser2, newGame){
  //Validate the user making the request
  if(!isValidUser(requestingUser)){
    return null;
  }
  if(!isValidUser(requestingUser2)){
    return null;
  }
  newGame.id  =  Math.random();
  newGame.redPlayer = requestingUser.username;
  newGame.yellowPlayer = requestingUser2.username;
  nextQuizID++;
  requestingUser1.games_active.push(newGame.id)

  requestingUser2.games_active.push(newGame.id)
  //Add the new quiz ID to the users list of created quizzes
  users[requestingUser.username].games_active.push(newGame.id);
  return newGame;
}

//what happens if someone wins like the result of the match
function winner(requestingUser1, requestingUser2, game){
  if  (checkWinner(  game) == 'red'){
    if (requestingUser1.games_active.id.colour == 'red'){
    requestingUser1.games_played.push(game);
    requestingUser1.games_active.remove(game) ;
     requestingUser1.win +=1 ;
    requestingUser2.total +=1 ;
    requestingUser2.games_played.push(game);
    requestingUser2.games_active.remove(game) ;
     requestingUser2.win +=1 ;
    requestingUser2.total +=1 ;
  }
  }

}
// here we check for any winners in the game
function checkWinner(  game){
  let correct = 0;
  //looks for winner in the game
  for(let i = 0; i < game.length; i++){
    for(let j = 0; j < game[0].length; j++){
      if(game[i][j]==game[i][j+1]==game[i][j+2]==game[i][j+3]){
          return game[i][j]
    }else if (game[i][j]==game[i+1][j]==game[i+2][j]==game[i+3][j]){
      return game[i][j]
    }else if (game[i][j]==game[i+1][j+1]==game[i+2][j+2]==game[i+3][j+3]){
      return game[i][j]
    }else{
      return null;
    }
  }

}
