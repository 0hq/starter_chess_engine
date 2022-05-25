// const { evalMove } = require("./will.js");

/*
 * A simple chess AI, by someone who doesn't know how to play chess.
 * Uses the chessboard.js and chess.js libraries.
 *
 * Copyright (c) 2020 Zhang Zeyu
 */

// var old = console.log;
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

function onDragStart(source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false;
}

function makeRandomMove() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  var randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen());
}

function makeAIMove() {
  o("make ai move");
  game.move(evalMove(game));
  board.position(game.fen());
}

function onDrop(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  move ? o(move) : null;

  // illegal move
  if (move === null) return "snapback";

  // make random legal move for black
  window.setTimeout(makeAIMove, 250);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};

board = Chessboard("myBoard", config);
