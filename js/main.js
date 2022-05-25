// will's chess ai

var logger = document.getElementById("logger");
o = function (message) {
  if (typeof message == "object") {
    logger.innerHTML +=
      (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
  } else {
    logger.innerHTML += message + "<br />";
  }
};
var board = null;
var $board = $("#myBoard");
var game = new Chess();

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";
  o("--- Player Move ---");
  o(move.san);

  // make random legal move for black
  window.setTimeout(makeAIMove, 250);
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

board = Chessboard("myBoard", config);

//
// -------------- actual important stuff below -----
//

function makeRandomMove() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen());
}

function makeAIMove() {
  game.move(evalMove(game));
  board.position(game.fen());
}
