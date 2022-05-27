const DEPTH_SEARCH = 1;
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

  let result = minimaxAlphaBeta(chess, DEPTH_SEARCH, prune(moves, chess), -Infinity, Infinity, isMax, true);
  console.log(result);
  // console.log(chess.fen());
  // console.log(evaluatePosition(chess));

  let end = new Date();
  console.log(`Time taken in secs: ${(end - start) / 1000}`);
  console.log(`Nodes explored is ${nodesExplored}`);

  return result[0];
}

function prune(moves, gameState) {
  let checkmate = moves.filter((m) => m.includes("#"));
  moves = moves.filter((m) => !m.includes("#"));
  let promote = moves.filter((m) => m.includes("="));
  moves = moves.filter((m) => !m.includes("="));
  let take = moves.filter((m) => m.includes("x"));
  moves = moves.filter((m) => !m.includes("x"));
  let check = moves.filter((m) => m.includes("+"));
  moves = moves.filter((m) => !m.includes("+"));
  let queens = moves.filter((m) => m.includes("Q"));
  moves = moves.filter((m) => !m.includes("Q"));
  let rooks = moves.filter((m) => m.includes("R"));
  moves = moves.filter((m) => !m.includes("R"));
  let bishops = moves.filter((m) => m.includes("B"));
  moves = moves.filter((m) => !m.includes("B"));
  let knights = moves.filter((m) => m.includes("N"));
  moves = moves.filter((m) => !m.includes("N"));
  // console.log(checkmate, promote, take, check, queens, rooks, bishops, knights, moves);
  // console.log(checkmate.concat(promote, take, check, queens, rooks, bishops, knights, moves))
  let output = checkmate.concat(promote, take, check, queens, rooks, bishops, knights, moves);
  return output.slice(0, 20);
}

// fixes horizon issue
function quiesce(startingState, maximizingPlayer) {
  let moves = startingState.moves();
  let checkmate = moves.filter((m) => m.includes("#"));
  let take = moves.filter((m) => m.includes("x"));
  let promote = moves.filter((m) => m.includes("="));
  moves = [...checkmate, ...take, ...promote];
  // console.log(moves);
  if (moves.length == 0) {
    return [null, evaluatePosition(startingState), []];
  } else {
    if (maximizingPlayer) {
      let maxEval = -Infinity, // minimum value, so that anything will be larger
        bestMove = null;
      for (let index = 0; index < moves.length; index++) {
        const move = moves[index];
        startingState.move(move); // simulate the move

        // evaluate the position
        let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, 0, null, null, null, false);

        startingState.undo(); // revert the simulated move

        // if this move is better than anything seen before, keep it!
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = move;
        }
      }
      return [bestMove, maxEval, [bestMove + "(q)"]];
    } else {
      // if this is the enemy playing, we're looking to minimize!
      let minEval = Infinity,
        bestMove = null; // maximum value, so that anything will be smaller
      for (let index = 0; index < moves.length; index++) {
        const move = moves[index];
        startingState.move(move); // simulate the move

        // evaluate the position
        let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, 0, null, null, null, false);

        startingState.undo(); // revert the simulated move

        // if this move is better than anything seen before, keep it!
        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = move;
        }
      }
      return [bestMove, minEval, [bestMove + "(q)"]];
    }
  }
}

function minimaxAlphaBeta(startingState, depth, moves, alpha, beta, maximizingPlayer, isRoot = false) {
  if (depth === 0 || moves.length === 0) {
    let result = quiesce(startingState, maximizingPlayer);
    // console.log(result);
    return result;
    return [null, evaluatePosition(startingState)];
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity, // minimum value, so that anything will be larger
      bestMove = null,
      history = [];
    for (let index = 0; index < moves.length; index++) {
      const move = moves[index];
      startingState.move(move); // simulate the move
      // aiboard.position(startingState.fen());

      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(
        startingState,
        depth - 1,
        prune(startingState.moves(), startingState),
        alpha,
        beta,
        false
      );

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
      if (maxEval >= beta) {
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
      let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(
        startingState,
        depth - 1,
        prune(startingState.moves(), startingState),
        alpha,
        beta,
        true
      );

      startingState.undo(); // revert the simulated move

      if (isRoot) {
        console.log(evaluation, move, returnedHistory);
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
      if (minEval <= alpha) {
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

if (typeof define !== "undefined")
  define(function () {
    return evalMove;
  });
