const DEPTH_SEARCH = 4;
let startTime = null;
let nodesExplored = 0;
// let memo = {};

var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000, k_e: 60000 };
var pst_w = {
  p: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  b: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  r: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  k: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],

  // Endgame King Table
  k_e: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};
var pst_b = {
  p: pst_w["p"].slice().reverse(),
  n: pst_w["n"].slice().reverse(),
  b: pst_w["b"].slice().reverse(),
  r: pst_w["r"].slice().reverse(),
  q: pst_w["q"].slice().reverse(),
  k: pst_w["k"].slice().reverse(),
  k_e: pst_w["k_e"].slice().reverse(),
};

function rewriteEval(chess, isMax = false) {
  o(`(${game.fen().split(" ")[5]}) --- Agent ---`);
  let move = evaluate(chess, isMax);
  o(move);
  o("\n");
  return move;
}

d = function (message, depth) {
  if (depth == 0) return;
  console.log(" - ".repeat(DEPTH_SEARCH - depth), message);
};

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

// --------------------------- primitive stuff ----------

function evaluate(chess, isMax) {
  let moves = chess.moves();
  console.log("All moves", prune(chess, true));

  nodesExplored = 0;
  let start = new Date();
  startTime = start;

  let result = minimaxAlphaBeta(chess, DEPTH_SEARCH, prune(chess), -Infinity, Infinity, isMax, true);
  // console.log(result, memo);
  // memo = memo[result[0]];
  // console.log(memo);
  // console.log(chess.fen());
  // console.log(evaluatePosition(chess));

  let end = new Date();
  console.log(`Time taken in secs: ${(end - start) / 1000}`);
  console.log(`Nodes explored is ${nodesExplored}`);

  return result[0];
}

function evaluate_move(board, move) {
  if (move.san.includes("#")) return Infinity;
  if (move.san.includes("=")) return 1000;

  let capture = 0;
  if (move.san.includes("x")) capture = evaluate_capture(board, move);

  let isMax = move["color"] == "w";
  let from = evaluate_piece(move.piece, move["from"][0], move["from"][1], isMax);
  let to = evaluate_piece(move.piece, move["to"][0], move["to"][1], isMax);
  let position = to - from;

  let value = position + capture;
  move.score = value;
  return [move.san, value * -1];
}

function evaluate_piece(element, xL, yX, isMax) {
  let x = xL.charCodeAt(0) - 97;
  let y = parseInt(yX) - 1;
  // console.log(element, xL, x, yX, y, isMax);
  if (isMax) {
    return pst_w[element][x][y];
  } else {
    return pst_b[element][x][y];
  }
}

function evaluate_capture(board, move) {
  return weights[move["captured"]] - weights[move["piece"]];
}

function prune(gameState, doPrint = false) {
  let moves = gameState.moves({ verbose: true });
  let evaluated = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    evaluated.push(evaluate_move(gameState, move));
  }

  evaluated.sort((a, b) => {
    return b[1] - a[1];
  });
  evaluated = evaluated.filter((x) => {
    return x[1] > -10;
  });
  let map = evaluated.map((x) => x[0]);
  let filtered = map.filter((word) => word);
  if (doPrint) {
    console.log(evaluated);
  }
  return filtered;
}

// fixes horizon issue
function quiesce(startingState, maximizingPlayer, alpha, beta, depth) {
  let moves = startingState.moves({ verbose: true });
  let checkmate = moves.filter((m) => m.includes("#"));
  let take = moves.filter((m) => m.includes("x"));
  let promote = moves.filter((m) => m.includes("="));
  moves = [...checkmate, ...take, ...promote];
  let board_value = evaluatePosition(startingState);
  if (moves.length == 0) {
    return [null, board_value, []];
  } else {
    // console.log("moves", moves);
    // console.log(startingState.ascii());

    // console.log("moves and value", moves, board_value);

    // console.log("x".repeat(DEPTH_SEARCH - depth));
    if (maximizingPlayer) {
      let maxEval = -Infinity, // minimum value, so that anything will be larger
        bestMove = null,
        history = [];
      for (let index = 0; index < moves.length; index++) {
        const move = moves[index];
        startingState.move(move); // simulate the move

        // evaluate the position
        // console.log("(q) searching down one more with move", move);
        let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, null, alpha, beta, false);

        startingState.undo(); // revert the simulated move

        // if this move is better than anything seen before, keep it!
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = move;
          history = [move + "(q)", ...returnedHistory];
        }
        if (maxEval > alpha) {
          alpha = maxEval;
        }
        if (alpha >= beta) {
          break;
        }
      }
      // console.log("wrapped one layer (white)", maxEval, bestMove, board_value, history);
      if (maxEval >= board_value) return [bestMove, maxEval, history];
      else return [null, board_value, []];
    } else {
      // if this is the enemy playing, we're looking to minimize!
      let minEval = Infinity,
        bestMove = null,
        history = []; // maximum value, so that anything will be smaller
      for (let index = 0; index < moves.length; index++) {
        const move = moves[index];
        startingState.move(move); // simulate the move

        // evaluate the position
        // console.log("(q) searching down one more with move", move);
        let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, 0, null, alpha, beta, true);

        startingState.undo(); // revert the simulated move

        // if this move is better than anything seen before, keep it!
        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = move;
          history = [move + "(q)", ...returnedHistory];
        }
        if (minEval < beta) {
          beta = minEval;
        }
        if (beta <= alpha) {
          break;
        }
      }

      // console.log("wrapped one layer (black)", minEval, bestMove, board_value, history);
      if (minEval <= board_value) return [bestMove, minEval, history];
      else return [null, board_value, []];
    }
  }
}

function minimaxAlphaBeta(startingState, depth, moves, alpha, beta, maximizingPlayer, isRoot = false) {
  if (depth <= 0 || moves.length === 0) {
    return [null, evaluatePosition(startingState), []];
    // console.log("quiesce", maximizingPlayer, startingState.ascii());
    let result = quiesce(startingState, maximizingPlayer, alpha, beta, depth);
    // console.log("quiesce done", nodes);
    return result;
    return [null, evaluatePosition(startingState)];
  }
  // console.log("-".repeat(DEPTH_SEARCH - depth));

  if (maximizingPlayer) {
    let maxEval = -Infinity, // minimum value, so that anything will be larger
      bestMove = null,
      history = [];
    for (let index = 0; index < moves.length; index++) {
      let move = moves[index];
      startingState.move(move); // simulate the move
      // aiboard.position(startingState.fen());
      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, prune(startingState), alpha, beta, false);

      startingState.undo(); // revert the simulated move

      // if this move is better than anything seen before, keep it!
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
        history = [move, ...returnedHistory];
      }
      if (maxEval > alpha) {
        alpha = maxEval;
      }
      if (alpha >= beta) {
        break;
      }
    }
    // console.log([bestMove, maxEval, history]);
    return [bestMove, maxEval, history];
  } else {
    // if this is the enemy playing, we're looking to minimize!
    let minEval = Infinity, // maximum value, so that anything will be smaller
      bestMove = null,
      history = [];
    for (let index = 0; index < moves.length; index++) {
      const move = moves[index];
      startingState.move(move); // simulate the move

      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, prune(startingState), alpha, beta, true);

      startingState.undo(); // revert the simulated move

      if (isRoot) {
        console.log("root move done:", evaluation);
        console.log(move, returnedHistory);
      }

      // if this move is better than anything seen before, keep it!
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
        history = [move, ...returnedHistory];
      }
      if (minEval < beta) {
        beta = minEval;
      }
      if (beta <= alpha) {
        break;
      }
    }
    // console.log([bestMove, minEval, history]);
    return [bestMove, minEval, history];
  }
}

function evaluatePosition(chess) {
  nodesExplored++;
  // console.log("get_score");
  let text = chess.fen().split(" ")[0].split("");
  let whitescore = 0,
    blackscore = 0;
  let chars = text.filter((char) => {
    return char.length === 1 && char.match(/[a-z]/i);
  });
  // console.log(chars);
  for (let index = 0; index < chars.length; index++) {
    const element = chars[index];
    const lower = element.toLowerCase();
    let points = 0;
    switch (lower) {
      case "r":
        points = 5;
        break;
      case "n":
        points = 3;
        break;
      case "b":
        points = 3;
        break;
      case "q":
        points = 9;
        break;
      case "p":
        points = 1;
        break;
    }
    if (chess.game_over()) points += 200; // add 200 points to whoever turn it is if it's game over
    element == lower ? (blackscore += points) : (whitescore += points);
  }
  if (chess.turn() == "w") {
    whitescore += 0.1 * mobility(chess);
    let undo = new Chess(chess.fen());
    undo.undo();
    blackscore += 0.1 * mobility(undo);
  } else {
    blackscore += 0.1 * mobility(chess);
    let undo = new Chess(chess.fen());
    undo.undo();
    whitescore += 0.1 * mobility(undo);
  }
  return whitescore - blackscore;
}

function mobility(chess) {
  return chess.moves().length;
}

function piece_value(element) {
  const lower = element.toLowerCase();
  let points = 0;
  switch (lower) {
    case "r":
      points = 5;
      break;
    case "n":
      points = 3;
      break;
    case "b":
      points = 3;
      break;
    case "q":
      points = 9;
      break;
    case "p":
      points = 1;
      break;
    case "k":
      points = 1000;
      break;
  }
  return points;
}

// let checkmate = moves.filter((m) => m.includes("#"));
// moves = moves.filter((m) => !m.includes("#"));
// let promote = moves.filter((m) => m.includes("="));
// moves = moves.filter((m) => !m.includes("="));
// let take = moves.filter((m) => m.includes("x"));
// moves = moves.filter((m) => !m.includes("x"));
// let check = moves.filter((m) => m.includes("+"));
// moves = moves.filter((m) => !m.includes("+"));
// let queens = moves.filter((m) => m.includes("Q"));
// moves = moves.filter((m) => !m.includes("Q"));
// let rooks = moves.filter((m) => m.includes("R"));
// moves = moves.filter((m) => !m.includes("R"));
// let bishops = moves.filter((m) => m.includes("B"));
// moves = moves.filter((m) => !m.includes("B"));
// let knights = moves.filter((m) => m.includes("N"));
// moves = moves.filter((m) => !m.includes("N"));
// // console.log(checkmate, promote, take, check, queens, rooks, bishops, knights, moves);
// // console.log(checkmate.concat(promote, take, check, queens, rooks, bishops, knights, moves))
// let output = checkmate.concat(promote, take, check, queens, rooks, bishops, knights, moves);
// // output.sort(function (a, b) {
// //   return 0.5 - Math.random();
// // });
// // output.sort((a, b) => {
// //   if (!memo[a] && !memo[b]) {
// //     return 0;
// //   } else if (memo[a] && !memo[b]) {
// //     return -1;
// //   } else if (!memo[a] && memo[b]) {
// //     return 1;
// //   } else {
// //     return memo[a] - memo[b];
// //   }
// // });
// // console.log(output, memo);
