// It only highlights the first move,
  // Should highlight after each saved turn
// Should be able to undo a turn
// Implement a timer 

const root = document.getElementById('root');
const changeTurnButton = document.getElementById('endTurn');
const undoTurnButton = document.getElementById('undoTurn');
const turnMessage = document.getElementById('turn');
// Need to make sure can't change turn if there has not been a move
// Keeping track of a valid move, before moved, during, after

const store = {
  clicked: false,
  currentClick: null,
  redTurn: true,
  redPiecesLost: 0,
  bluePiecesLost: 0,
  gameOver: false,
  moved: false,
  pieceTaken: false,
}

const setMessage = () => {
  const turn = store.redTurn ? 'red' : 'blue'
  const message = `It's ${turn}'s turn`;

  const turnMsg = document.createElement('div');
  turnMsg.textContent = message;
  turnMessage.innerHTML = '';
  turnMessage.appendChild(turnMsg);
}


const makeBoard = () => {
  let counter = true;
  for (let i = 0; i < 8; i += 1) {
    counter = !counter;
    for (let j = 0; j < 8; j += 1) {
      if (counter) {
        let blackSquare = createBlackSquare(i, j);
        root.appendChild(blackSquare);
        counter = false;

        if (i < 3) {
          let piece = createPiece('redTeam');
          blackSquare.appendChild(piece);
        } else if (i > 4) {
          let piece = createPiece('blueTeam');
          blackSquare.appendChild(piece);
        }

        blackSquare.addEventListener('click', (elem) => {
          handleClick(elem);
        });

      } else {
        let whiteSquare = createWhiteSquare(i, j);
        root.appendChild(whiteSquare);
        counter = true;
      }
    }
  }
}

const checkTurn = (elem) => {
  if (!store.clicked) {
    let colorClicked = elem.target.classList[0];
    if (colorClicked === 'black' && elem.target.hasChildNodes()) {
      colorClicked = elem.target.childNodes[0].classList[0];
    }
    if (store.redTurn) {
      if (colorClicked !== 'redTeam') return false;
    } else {
      if (colorClicked !== 'blueTeam') return false;
    }
    return true;
  }

  return true;
}

const handleClick = (elem) => {
  if (store.gameOver) return;
  if (checkTurn(elem)) {
    const squareID = (elem.target.classList.contains('redTeam') || 
                      elem.target.classList.contains('blueTeam')) ? 
                      Number(elem.target.parentNode.id) : Number(elem.target.id);
    
    const currSquare = document.getElementById(squareID);

    // If we have clicked already, either reset if clicking the same square
    // or handle the move
    if (store.clicked) {
      if (squareID === store.currentClick && !store.moved) {
        toggleHighlight(currSquare);
      } else {
        handleMove(squareID);
      }
    } else {
      // If we haven't clicked yet, check that we are on a square with a piece
      // and modify state accordingly if we are
      if (currSquare.hasChildNodes()) {
        toggleHighlight(currSquare, squareID);
      }
    }
  }
  console.log(store);
}

const handleMove = (id) => {
  if (store.clicked) {
    const squareID = id;
    
    const square = document.getElementById(squareID);
    const oldSquare = document.getElementById(store.currentClick);
    const moveDifference = store.currentClick - squareID;
    const turn = store.redTurn ? 'red' : 'blue'
    let piece;
    canJump(moveDifference, oldSquare, square, store.currentClick, id, turn);

    if (!store.redTurn) {
      if ((moveDifference === 7 || moveDifference === 9) && !square.hasChildNodes() && !store.pieceTaken) {
        piece = createPiece('blueTeam');
        square.appendChild(piece);
        removePiece(oldSquare);
        store.moved = true;
      }
    } else {
      if ((moveDifference === -7 || moveDifference === -9) && !square.hasChildNodes() && !store.pieceTaken) {
        piece = createPiece('redTeam');
        square.appendChild(piece);
        removePiece(oldSquare);
        store.moved = true;
      }
    }
    addKing(square, piece, turn);                   
  }
}

const addKing = (square, piece, turn) => {
  const redKingSpots = [56, 58, 60, 62];
  const blueKingSpots = [1, 3, 5, 7];
  
  if (turn === 'red') {
    if (redKingSpots.includes(Number(square.id))) {
      piece.setAttribute('class', 'redKing');
    }
  } else {
    if (blueKingSpots.includes(Number(square.id))) {
      piece.setAttribute('class', 'blueKing');
    }
  }
}

const createBlackSquare = (i, j) => {
  let blackSquare = document.createElement('div');
  blackSquare.setAttribute('class', 'black');
  blackSquare.setAttribute('id', (i * 8) + j);
  return blackSquare;
}

const createWhiteSquare = (i, j) => {
  let whiteSquare = document.createElement('div');
  whiteSquare.setAttribute('class', 'white');
  whiteSquare.setAttribute('id', (i * 8) + j);
  return whiteSquare;
}

const removeJumped = (start, finish) => {
  let location = Math.abs(finish - start) / 2;
  location = finish > start ? start + location : start - location;
  const square = document.getElementById(location);
  square.removeChild(square.childNodes[0]);
}

const createPiece = (colorTeam) => {
  const piece = document.createElement('div');
  piece.setAttribute('class', colorTeam);
  return piece;
}

const toggleHighlight = (currSquare, id = null) => {
  store.clicked = !store.clicked;
  store.currentClick = id;
  currSquare.classList.toggle('clicked');
}

const removePiece = (square) => {
  square.removeChild(square.childNodes[0]);
  square.classList.remove('clicked');
}

const changeTurn = (piece) => {
  updateStoreTurn();
  setMessage();
  if (piece && piece.classList.contains('clicked')) piece.classList.toggle('clicked');
}

const canJump = (difference, oldSquare, square, start, finish, color) => {
  if (color === 'red') {
    const downLeft = document.getElementById((store.currentClick + 7));
    const downRight = document.getElementById((store.currentClick + 9));

    if (downLeft && downLeft.hasChildNodes()) {
      if (difference === -14 && downLeft.childNodes[0].classList[0] === 'blueTeam') {
        jumps(oldSquare, start, finish, square, color);
      }
    }
    if (downRight && downRight.hasChildNodes()) {
      if (difference === -18 && downRight.childNodes[0].classList[0] === 'blueTeam') {
        jumps(oldSquare, start, finish, square, color);
      }
    } 
  } else if (color === 'blue') {
    const upLeft = document.getElementById((store.currentClick - 7));
    const upRight = document.getElementById((store.currentClick - 9));
  
    if (upLeft && upLeft.hasChildNodes()) {
      if (difference === 14 && upLeft.childNodes[0].classList[0] === 'redTeam') {
        jumps(oldSquare, start, finish, square, color);
      }
    }
    if (upRight && upRight.hasChildNodes()) {
      if (difference === 18 && upRight.childNodes[0].classList[0] === 'redTeam') {
        jumps(oldSquare, start, finish, square, color);
      }
    } 
  }
}

const jumps = (oldSquare, start, finish, square, color) => {
  let piece = createPiece(`${color}Team`);
  checkForKing(oldSquare, piece);
  square.appendChild(piece);
  removePiece(oldSquare);
  removeJumped(start, finish);
  color === 'red' ? store.bluePiecesLost += 1 : store.redPiecesLost += 1;
  updateStoreJump(square);
  handleMove(store.currentClick);
}

const checkForKing = (square, piece, color) => {
  if (square.childNodes[0].classList.contains(`${color}King`)) {
    piece.setAttribute('class', `${color}King`);
  }
}

const updateStoreJump = (spot) => {
  store.moved = true;
  store.pieceTaken = true;
  store.clicked = !store.clicked;
  store.currentClick = Number(spot.id);
}

const updateStoreTurn = () => {
  store.redTurn = !store.redTurn;
  store.clicked = false;
  store.currentClick = null;
  store.moved = false;
  store.pieceTaken = false;
}

const checkGameOver = () => {
  if (store.redPiecesLost === 12 || store.bluePiecesLost === 12) {
    store.gameOver = true;
    console.log('game over');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setMessage();
  makeBoard();
});

changeTurnButton.addEventListener('click', () => {
  let piece = document.getElementById(store.currentClick);
  if (store.moved) changeTurn(piece);
})

