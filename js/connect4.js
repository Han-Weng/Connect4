
function checkHorizontal(row,col,gameBoard){
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
 function checkVertical(row,col,gameBoard){
    let colour = ['red','yellow']
    let index =0;
    let points = 0;
    while (index <2){
    for (var i = row-3; i <= row+3 ; i++) {
      if ((i >=0 && i +3< 6)){
        if ((gameBoard[i][col]==colour[index])&&(gameBoard[i+1][col]==colour[index])&&(gameBoard[i+2][col]==colour[index])&&(gameBoard[i+3][col]==colour[index])){
 
          return colour[index]
        }
    }
    }
    index++;
 
  }
    return "";
  }
 function checkLeftDiagonal(row,col,gameBoard){
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
 function checkRightDiagonal(row,col,gameBoard){
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
 function winnerAlgorithm(row,col,gameBoard){
 
      var checkDirection = [checkHorizontal(row,col,gameBoard), checkVertical(row,col,gameBoard),
                        checkLeftDiagonal(row,col,gameBoard), checkRightDiagonal(row,col,gameBoard)]
    for (var i = 0; i < checkDirection.length ; i++) {
       if (checkDirection[i]!=""){
        return checkDirection[i];
      }
    }
    return checkDirection[i];
  }

  module.exports ={
      winnerAlgorithm, checkVertical, checkHorizontal, checkLeftDiagonal, checkRightDiagonal
  }