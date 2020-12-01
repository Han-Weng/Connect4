


function chat(req,res){
   var map = games_active_array(req.body.enemy)
   map.chat.push(req.session.name)
   map.chat.push(req.body.chat)
  res.redirect(req.get('referer'));;
}

function input(req, res){
  var numbersOnly = (req.body.input).match(/[0-6]/);
  var length = ((req.body.input).length);
  var player=0
  var playerColour=1
  var map = games_active_array(req.body.array)

  if ((map.connect4[0][req.body.input] != "white")||((numbersOnly == null)||(length >1)||((map.turn[player]!=req.session.name)))){
    res.redirect(req.get('referer'));;
    return 0;
  }
  for (var i = 5; i >= 0; i--) {
 	  if (map.connect4[i][req.body.input] == "white"){
			map.connect4[i][req.body.input] =  map.turn[playerColour]

      console.log("so whats going on this time ", winnerAlgorithm(i,req.body.input,map.connect4))

       map.winner  = winnerAlgorithm(i,req.body.input,map.connect4)

      if (draw(map)=="draw"){
         map.winner  = draw(map)
        res.redirect(req.get('referer'));;
      }
        if (map.turn == map.yellow){
         map.turn  = map.red
         }else{
          map.turn  = map.yellow
        }
      res.redirect(req.get('referer'));;
			return 0
		}
	}
  res.redirect(req.get('referer'));;

}
function draw(map){
  for (var i = 6; i >= 0; i--) {
    if (map.connect4[0][i] != "white"){
      return "not draw";
    }
  }
  return "  draw";
}


module.exports ={
    draw, input, chat
}