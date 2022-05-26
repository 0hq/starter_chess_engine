// will's chess ai
// var fen = "rnbqk1nr/p2pppb1/2p3pp/1p2P3/2BP4/5N2/PPP2PPP/RNBQK2R w KQkq - 1 5";
var fen = "3b2k1/1p3p2/p1p5/2P4p/1P2P1p1/5p2/5P2/4RK2 w - - 0 1";
var start = fen ? fen : "start";
var logger = document.getElementById("logger");
o = function (message) {
  console.log(message);
};
var board = null;
var $board = $("#myBoard");
var game = new Chess(fen);
// var aiboard = null;
// var $aiboard = $("#aiBoard");

var config = {
  draggable: false,
  position: start,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

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
  o(`(${game.fen().split(" ")[5]}) --- Player ---`);
  o(move.san);

  // make random legal move for black
  window.setTimeout(makeAIMove, 250);
}

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) {
    o(game.pgn());
    return false;
  }

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}

// aiboard = Chessboard("aiBoard", config);
board = Chessboard("myBoard", config);

//
// -------------- actual important stuff below -----
//

function makeRandomMove() {
  var possibleMoves = game.moves();
  console.log(possibleMoves);

  // game over
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen());
  window.setTimeout(makeAIMove, 500);
}

function makeAIMove() {
  game.move(rewriteEval(game, false));
  board.position(game.fen());
  window.setTimeout(makeRandomMove, 500);
}

// function makeOtherAIMove() {
//   game.move(game.moves()[Math.floor(Math.random() * game.moves().length)]);
// }

function makeAIsPlay(isMax) {
  if (isMax) makeAIMove();
  else makeOtherAIMove();
}

// board.position(game.fen());
window.setTimeout(makeRandomMove, 500);

// function makeAIMoveOld() {
//   game.move(evalMove(game, false));
//   board.position(game.fen());
// }
