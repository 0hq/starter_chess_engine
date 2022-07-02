var board = null;
var game = new Chess();

function makeRandomMove() {
  // chess.js gives us all the possible moves in an array
  // [ move1, move2, move3 ... ]
  var possibleMoves = game.moves();

  // exit if the game is over
  if (game.game_over()) return;

  // choses a random index in the list
  var randomIdx = Math.floor(Math.random() * possibleMoves.length);

  // updates javascript board state
  game.move(possibleMoves[randomIdx]);

  // changes html board state
  board.position(game.fen());

  // call this function again in 5 secs
  window.setTimeout(makeRandomMove, 500);
}

board = Chessboard("myBoard", "start");

window.setTimeout(makeRandomMove, 500);
