var fs = require('fs');
var rawdata = fs.readFileSync('./data/data.json');
 var rawgame = fs.readFileSync('./data/game.json');

 var data = JSON.parse(rawdata);
 var game = JSON.parse(rawgame);
 
function watchgame(req, res){
  var rawgame = fs.readFileSync('./data/game.json');

  var game = JSON.parse(rawgame);

  console.log(req.body.name)
    for(var i = 0; i <  game.length; i++){
      if(parseInt(req.body.name) ==game[i].id ){
        res.redirect("/watch/" +game[i].id);
        return 0;
      }
  }
  console.log("data is ....", req.body)
}

function next(req,res){
  //given the history of a game you click next or prev to see what was
//made at what position, if the user passes next too much
  var next =(req.body.next).substring(0, 4);
  var id =(req.body.next).substring(4);
  console.log("this data is ",id)
  console.log("this tape is ",findGamid(id).tape)

  console.log("this record is ",findGamid(id).record)

 
   if ((next == "next")&&(findGamid(id).tape !=findGamid(id).record )){
    findGamid(id).tape++
  }else if ((next == "prev")&&((findGamid(id).tape !=0))){
    console.log(req.body.next)
    findGamid(id).tape--
  }
  res.redirect(req.get('referer'));;
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

  module.exports ={
    watchgame,next
}