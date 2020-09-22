let xLength = 7
let yLength = 6
let gameBoard=[]
let turn  = "X"

function main(){


}

 


function checkHorizontal(row,col){
  for (var i = 0; i <= yLength; i++) {
    for (var j = 0; j <= xLength-2; j++) {
    	if (gameBoard[i][j] == gameBoard[i][j+1]){
    		if (gameBoard[i][j+1] == gameBoard[i][j+2]){
    			if (gameBoard[i][j+2] == gameBoard[i][j+3]){
    				return True
    			}
     		}
    	}
    }
	}	
}

function checkVeritcal(){
  for (var i = 0; i <= yLength; i++) {
    for (var j = 0; j <= xLengthv; j++) {
    	if (gameBoard[i][j] == gameBoard[i+1][j]){
    		if (gameBoard[i+1][j] == gameBoard[i+2][j]){
    			if (gameBoard[i+2][j] == gameBoard[i+3][j]){
    				return True
    			}
     		}
    	}
    }
	}	
}

function checkRightDiagonal(){}
function checkLeftDiagonal(){}

function winnerAlgorithm(col,row){
	checkHorizontal()
	if (gameBoard[4].includes("r")||gameBoard[4].includes("y")){
  	
  }
 

}
function draw(){}

function makeMap(){
	//Make the gameboard layout and coordinates 
  for (var i = 0; i <= yLength; i++) {
					gameBoard.push([])
          for (var j = 0; j <= xLength; j++) {
            gameBoard[i][j] = "O"
          }
  }
}

function dropCoin(coin){
	console.log(coin.col)
	for (var i = 6; i > 0; i--) {
	  if (gameBoard[i][coin.col] == "O"){
			gameBoard[i][coin.col] = coin.colour
			return 0
		}
	}
}

function printTheGrid(){
	var line = ""
	 for (var i = 0; i <= yLength; i++) {
	 	line+= ("<br>") ;
    for (var j = 0; j <= xLength; j++) {
			line += " " +gameBoard[i][j] + " ";
		}
	}
	document.getElementById("demo").innerHTML = line;
}


function players(){
  var x = document.getElementById("myText").value;
  document.getElementById("input").innerHTML = x;
  if (turn == "X"){
  	turn = "Y";
  }else{
  	turn = "X";
  }
  dropCoin( {col:x ,colour: turn});	
  printTheGrid()
}
 
makeMap()
printTheGrid()
 
console.log(gameBoard)

