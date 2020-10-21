let xLength = 7
let yLength = 6
let gameBoard=[]
let turn  = "red"
let size =  75
let diameter =  20
var coin = Math.floor(Math.random() * (7 - 0 + 1)) + 1;

function checkHorizontal(row,col){
  for (var i = col-3; i <= col+3 ; i++) {
    if ((i >0 || i < 8)){
      if ((gameBoard[row][i]!="whites")&&(compareHorizontal(row,i,i+1) == 4)){
        return true
      }
    }
  }
}
function compareHorizontal(row,col,col2){
  if ((col2 < 7)){
    if (gameBoard[row][col] == gameBoard[row][col2]){
      return 1+compareHorizontal(row,col2,col2+1)
    }
  }
  return 0
}

function checkVertical(row,col){
  for (var i = row-3; i <= row+3 ; i++) {
    if ((i >0 || i < 7)){
      if ((gameBoard[i][col]!="whites")&&(compareHorizontal(i,i+1,col) == 4)){
        return true
      }
    }
  }
}
function compareVertical(row,row2,col){
  if ((row2 < 7)){
    if (gameBoard[row][col] == gameBoard[row1][col]){
      return 1+compareHorizontal(row,row2,col)
    }
  }
  return 0
}

function checkRightDiagonal(row,col){
  for (var i = row-3; i <= row+3 ; i++) {
    if ((row >0 || row < 7) &&(col >0 || col < 8)){
      if((gameBoard[i][i]!="whites")&&(compareRightDiagonal(row,col) == 4)){
        return true
      }
    }
  }
}
function compareRightDiagonal(row,col){
  if ((row < 6)&&(col < 7 )){
    if (gameBoard[row][col] == gameBoard[row+1][col+1]){
      return 1+checkRightDiagonal(row,col)
    }
  }
  return 0
}

function checkLeftDiagonal(row,col){
  for (var i = row-3; i <= row+3 ; i++) {
    if ((row >0 || row < 7) &&(col >0 || col < 8)){
      if((gameBoard[i][i]!="whites")&&(compareRightDiagonal(row,col) == 4)){
        return true
      }
    }
  }
}
function compareLeftDiagonal(row,col){
  if ((row < 6)&&(col < 7 )){
    if (gameBoard[row][col] == gameBoard[row-1][col+1]){
      return 1+checkRightDiagonal(row,col)
    }
  }
  return 0
}

function winnerAlgorithm(col,row){
	var checkDirection = [checkHorizontal(row,col), checktVertical(row,col),
                      checkLeftDiagonal(row,col), checkRightDiagonal(row,col)]
  for (var i = 0; i <= checkDirection.length ; i++) {
    if (checkDirection[i]){
     document.getElementById("winner").innerHTML = turn + " is Winner!!!!";
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
			return 0
		}
	}
}

function random(){

    if (turn == "red"){
       turn = "yellow";
    }else{
       turn = "red";
    }
    dropCoin( {col:(2-1) ,colour: turn});
    drawGrid()
    winnerAlgorithm(3,3)

}

function players(){
  var x = document.getElementById("myText").value;

  if (x.match(/[1-7]/g)){
    if (turn == "red"){
       turn = "yellow";
    }else{
       turn = "red";
    }
    dropCoin( {col:(x-1) ,colour: turn});
    drawGrid()
    winnerAlgorithm(3,3)
  }



}
makeMap()
drawGrid()
