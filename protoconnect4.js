let colSize = 6
let rowSize = 7
let gameBoard=[]
 
function main(){


}


function winnerAlgorithm(){}
function draw(){}

function makeMap(){
	//Make the gameboard layout and coordinates 
  for (var i = 0; i < rowSize; i++) {
					gameBoard.push([])
          for (var j = 0; j < colSize; j++) {
            gameBoard[i][j] = "*"
          }
  }
}

function redPlayer(){
	var redInput = Math.ceil(Math.random()*rowSize);	
  return {col:redInput,colour:'r'};	 
}

function yellowPlayer(){
	var yellowInput = Math.ceil(Math.random()*rowSize);	
  return {col:yellowInput,colour:'y'};	 
}

function dropCoin(coin){
	console.log(coin.col)
	for (var i = 6; i > 0; i--) {
	  if (gameBoard[i][coin.col] == "*"){
			gameBoard[i][coin.col] = coin.colour
			return 0
		}
	}
}



makeMap()
dropCoin(yellowPlayer())


console.log(gameBoard)

