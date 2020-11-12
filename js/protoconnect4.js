let xLength = 7
let yLength = 6
let gameBoard=[]
let turn  = "red"
let size =  75
let diameter =  20
var coin = Math.floor(Math.random() * (7 - 0 + 1)) + 1;

function checkHorizontal(row,col){
  let colour = ['red','yellow']
  let index =0;
  let points = 0;
  while (index <2){

  for (var i = col-3; i <= col+3 ; i++) {
    if ((i >=0 && i < 8)){
      if ((gameBoard[row][i]==colour[index])&&(gameBoard[row][i+1]==colour[index])&&(gameBoard[row][i+2]==colour[index])&&(gameBoard[row][i+3]==colour[index])){
        return colour[index]
      }

  }

}
  index++;
}
return "";
}
function checkVertical(row,col){
  let colour = ['red','yellow']
  let index =0;
  let points = 0;
  while (index <2){
  for (var i = row-3; i <= row+3 ; i++) {
    if ((i >=0 && i +3< 6)){
      console.log(i)
      if ((gameBoard[i][col]==colour[index])&&(gameBoard[i+1][col]==colour[index])&&(gameBoard[i+2][col]==colour[index])&&(gameBoard[i+3][col]==colour[index])){
        return colour[index]
      }
  }
  }
  index++;

}
  return "";
}

function checkLeftDiagonal(row,col){
  let colour = ['red','yellow']
  let index =0;
  let points = 0;
  let i = row-3;
  let j=col-3;
  // console.log("row"+row)
  // console.log("col"+col)

  while (index <2){
  i = row-3;
  j=col-3;
  while ((i+3 < 8)&&(j+3 < 7)) {
     // console.log(i)
     // console.log(j)

    if ((i  >=0 && i+3 < 6)&&(j  >=0 && j+3 < 7)){
      if ((gameBoard[i][j]==colour[index])&&(gameBoard[i+1][j+1]==colour[index])&&(gameBoard[i+2][j+2]==colour[index])&&(gameBoard[i+3][j+3]==colour[index])){
        return colour[index]
      }
  }
  i++
  j++
}
index++;
}
return "";
}

function checkRightDiagonal(row,col){
  let colour = ['red','yellow']
  let index =0;
  let points = 0;
  let i = row;
  let j=col;
  while (index <2){
      i = row+3;
      j=col-3;
  while ((i  >= 0)&&(j+3 < 7)) {
    if ((i-3  >=0 && i  < 6)&&(j  >=0 && j+3 < 7)){
      if ((gameBoard[i][j]==colour[index])&&(gameBoard[i-1][j+1]==colour[index])&&(gameBoard[i-2][j+2]==colour[index])&&(gameBoard[i-3][j+3]==colour[index])){
        return colour[index]
      }
}
    i--
    j++
}
  index++;
}
return "";
}

function winnerAlgorithm(row,col){
	var checkDirection = [checkHorizontal(row,col), checkVertical(row,col),
                      checkLeftDiagonal(row,col), checkRightDiagonal(row,col)]
  for (var i = 0; i < checkDirection.length ; i++) {
  //console.log(checkDirection[i])
    if (checkDirection[i]!=""){
    //  console.log(checkDirection[i])
     document.getElementById("winner").innerHTML = checkDirection[i]+ " is Winner!!!!";
    }
  }
}


function drawGrid(){
  var canvas = document.getElementById("grid");
  var ctx = canvas.getContext("2d");
  for(var i = 0; i < gameBoard.length; i++){
    for(var j = 0; j < gameBoard[i].length; j++){
        ctx.lineWidth = 2;
        ctx.fillStyle = gameBoard[i][j];
        ctx.beginPath();
        ctx.arc( size+ j*size,size+ i*size, diameter, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }
  }


}
function makeMap(){
	//Make the gameboard layout and coordinates
  for (var i = 0; i < yLength; i++) {
					gameBoard.push([])
          for (var j = 0; j < xLength; j++) {
            gameBoard[i][j] = "white"
          }
  }
}
function dropCoin(coin){

  for (var i = 5; i >= 0; i--) {
	  if (gameBoard[i][coin.col] == "white"){
			gameBoard[i][coin.col] = coin.colour
      winnerAlgorithm(i,coin.col)
			return 0
		}
	}
}

function players(){
  var x = document.getElementById("myText").value;
    if (turn == "red"){
       turn = "yellow";
    }else{
       turn = "red";
    }
    dropCoin( {col:(x-1) ,colour: turn});
    drawGrid()




}
makeMap()
drawGrid()
