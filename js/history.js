var fs = require('fs');

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



  module.exports ={
    watchgame
}