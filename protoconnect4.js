let xLength = 7
let yLength = 6
let gameBoard=[]
let turn  = "red"
let size =  50

function main(){


}

function checkHorizontal(row,col){
  for (var i = col-3; i <= col ; i++) {
    if ((i >0 || i < 7)){
      if ((gameBoard[row][i]!="whites")&&(compareHorizontal(row,i,row ,i+1) == 4)){
        return true
      }
    }
  }
}

function compareHorizontal(row,col,row2,col2){
    if ((col2 < 7)){
  if (gameBoard[row][col] == gameBoard[row][col2]){
    return 1+compareHorizontal(row2,col2,row2,col2+1)
  }
}
  return 0
}

function checkRightDiagonal(){}
function checkLeftDiagonal(){}
function winnerAlgorithm(col,row){
	//var checkDirection = [checkHorizontal(), checktVertical(),
  //                    checkLeftDiagonal(), checkRightDiagonal()]
  //for (var i = 0; i <= checkDirection.length ; i++) {
    if (checkHorizontal(row,col)){
     document.getElementById("winner").innerHTML = turn + " is Winner!!!!";
    }
  //}
}


function drawGrid(){

  var canvas = document.getElementById("grid");
  var ctx = canvas.getContext("2d");
  for(var i = 0; i < gameBoard.length; i++){
    for(var j = 0; j < gameBoard[i].length; j++){
        ctx.beginPath();
        ctx.arc( size+ j*size,size+ i*size, 10, 0, 2 * Math.PI);
        ctx.fillStyle = gameBoard[i][j];
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
