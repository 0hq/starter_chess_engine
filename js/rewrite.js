const DEPTH_SEARCH = 3;
let startTime = null;
let nodesExplored = 0;
let memo = {};

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
  console.log("All moves", prune(moves, chess));

  nodesExplored = 0;
  let start = new Date();
  startTime = start;

  let result = minimaxAlphaBeta(chess, DEPTH_SEARCH, prune(moves, chess), -Infinity, Infinity, isMax, memo, true);
  console.log(result, memo);
  memo = memo[result[0]];
  console.log(memo);
  // console.log(chess.fen());
  // console.log(evaluatePosition(chess));

  let end = new Date();
  console.log(`Time taken in secs: ${(end - start) / 1000}`);
  console.log(`Nodes explored is ${nodesExplored}`);

  return result[0];
}

function evaluate_move(board, move) {
  if (m.includes("#")) return Infinity;
  if (m.includes("=")) return 1000;
}

function prune(gameState) {
  let moves = startingState.moves({ verbose: true });
  let evaluated = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    evaluated[i] = evaluate_move(gameState, move);
  }

  evaluated.sort((a, b) => {
    b.score - a.score;
  });

  return evaluated;
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

function minimaxAlphaBeta(startingState, depth, moves, alpha, beta, maximizingPlayer, tree, isRoot = false) {
  if (depth <= 0 || moves.length === 0) {
    tree["end"] = true;
    return [null, evaluatePosition(startingState), []];
    // console.log("quiesce", maximizingPlayer, startingState.ascii());
    let result = quiesce(startingState, maximizingPlayer, alpha, beta, depth);
    // console.log("quiesce done", nodes);
    return result;
    return [null, evaluatePosition(startingState)];
  }
  console.log("-".repeat(DEPTH_SEARCH - depth));

  if (maximizingPlayer) {
    let maxEval = -Infinity, // minimum value, so that anything will be larger
      bestMove = null,
      history = [];
    for (let index = 0; index < moves.length; index++) {
      let move;
      if (memo[startingState.fen()]) {
      } else {
        move = moves[index];
      }
      startingState.move(move); // simulate the move
      // aiboard.position(startingState.fen());
      tree[move] = {};
      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, prune(startingState), alpha, beta, false, tree[move]);

      startingState.undo(); // revert the simulated move

      // if this move is better than anything seen before, keep it!
      tree[move]["norm"] = evaluatePosition(startingState);
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
        history = [move, ...returnedHistory];
      }
      if (maxEval > alpha) {
        alpha = maxEval;
      }
      if (alpha >= beta) {
        tree[move]["pruned"] = true;
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

      tree[move] = {};
      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, prune(startingState), alpha, beta, true, tree[move]);

      startingState.undo(); // revert the simulated move

      if (isRoot) {
        console.log("root move done:", evaluation);
        console.log(move, returnedHistory);
        console.log(tree);
      }

      tree[move]["norm"] = evaluatePosition(startingState);
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
        tree[move]["pruned"] = true;
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
