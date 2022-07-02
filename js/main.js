var board = null;
var $board = $("#myBoard");
var game = new Chess(undefined);
var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

board = Chessboard("myBoard", config);

function makeRandomMove() {
  // get available moves from chess.js
  const possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  // console.log(possibleMoves);

  // get a random move index
  const randomIdx = Math.floor(Math.random() * possibleMoves.length);

  // update board state
  game.move(possibleMoves[randomIdx]);

  // draw
  board.position(game.fen());
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

function onDrop(source, target) {
  // see if the move is legal
  console.log(game.fen());
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";

  console.log(`(${game.fen().split(" ")[5]}) --- Player ---`);
  console.log(move.san, "\n");

  // make random legal move for black
  window.setTimeout(makeRandomMove, 250);
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) {
    console.log(game.pgn());
    return false;
  }

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}
