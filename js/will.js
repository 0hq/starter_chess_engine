const DEPTH_SEARCH = 3;
const MAX_NEG = -100000000000;

function evalMove(chess) {
  o(`(${game.fen().split(" ")[5]}) --- Agent ---`);
  let move = evaluate(chess);
  o(move);
  o("\n");
  return move;
}

d = function (message, depth) {
  return;
  if (depth == 0) return;
  console.log(" - ".repeat(DEPTH_SEARCH - depth), message);
  // console.trace(message);

  // if (typeof message == "object") {
  //   logger.innerHTML +=
  //     (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
  // } else {
  //   logger.innerHTML += message + "<br />";
  // }
};

// --------------------------- primitive stuff ----------

let nodeCount = 0;
let startTime = null;

function evaluate(chess) {
  let moves = chess.moves();
  console.log("All moves", moves);
  let start = new Date();
  startTime = start;
  let result = alphabeta(chess, DEPTH_SEARCH, {});
  let end = new Date();
  console.log(`Time taken in secs: ${(end - start) / 1000}`);
  console.log(chess.fen());
  console.log(get_score(chess));
  return result.bestMove;
}

function good_moves(moves, limit = 25) {
  let checkmate = moves.filter((m) => m.includes("#"));
  moves = moves.filter((m) => !m.includes("#"));
  let promote = moves.filter((m) => m.includes("="));
  moves = moves.filter((m) => !m.includes("="));
  // let castle = moves.filter((m) => m.includes("O-O"));
  // moves = moves.filter((m) => !m.includes("#"))
  let take = moves.filter((m) => m.includes("x"));
  moves = moves.filter((m) => !m.includes("x"));
  let check = moves.filter((m) => m.includes("+"));
  moves = moves.filter((m) => !m.includes("+"));

  // o([...checkmate, ...promote, ...castle, ...take, ...random])
  // return random;
  // console.log([...checkmate, ...promote, ...take, ...check, ...moves]);
  return [...checkmate, ...promote, ...take, ...check, ...moves].slice(0, limit);
}

function prune(moves, gameState) {
  let result = good_moves(moves, 25);
  // d(`Starting search with this many moves ${result.length}`, depth);
  // d("Available moves:", 20);
  // d(result, 20);
  return result;
}

function minimax_new(startingState, depth) {
  if (depth === 0 || moves.length === 0) {
    return evaluatePosition(startingState);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity,
      bestMove = null; // minimum value, so that anything will be larger
    for (let index = 0; index < moves.length; index++) {
      const move = moves[index];

      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let evaluation = minimax_new(newState, depth - 1, false);

      // if this move is better than anything seen before, keep it!
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
    }
  } else {
    // if this is the enemy playing, we're looking to minimize!
    let minEval = Infinity,
      bestMove = null; // maximum value, so that anything will be smaller
    for (let index = 0; index < moves.length; index++) {
      const move = moves[index];

      // evaluate one more down, with the opposite player OR if it's done, just return evaluation
      let evaluation = minimax_new(newState, depth - 1, true);

      // if this move is better than anything seen before, keep it!
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
    }
  }
}

function alphabeta(gameState, depth, memory, alpha = -Infinity, beta = Infinity, side = -1, isRoot = true) {
  if (isRoot) nodeCount = 1;
  else ++nodeCount;

  const terminalEvaluation = gameState.game_over();
  if (terminalEvaluation == true) {
    return terminalEvaluation;
  }

  if (depth === 0) {
    return get_score(gameState, side);
  }

  let bestScore = -Infinity,
    bestMove = null,
    rootMoves = [];
  const moves = prune(gameState.moves(), gameState);

  for (let i = 0, len = moves.length; i < len; ++i) {
    const move = moves[i];
    const sideChanged = gameState.turn() == "w" ? 1 : -1;
    const newState = new Chess(gameState.fen());
    newState.move(move);
    memory[move] = { frozen_score: get_score(newState, side) };
    const score = sideChanged * alphabeta(newState, depth - 1, memory[move], sideChanged * alpha, sideChanged * beta, sideChanged * side, false);
    memory[move]["score"] = score;
    if (isRoot) {
      rootMoves.push([move, score]);
      const avgtime = (new Date() - startTime) / (i + 1) / 1000;
      const extrapolated = avgtime * (moves.length - i - 1);
      console.log(`done with ${move} in ${parseInt(avgtime)} secs. `);
      console.log(`eta in ${parseInt(extrapolated)} secs with ${nodeCount} iterated so far`);
    }
    if (score > bestScore) {
      bestScore = score;
    }
    if (bestScore > alpha) {
      alpha = bestScore;
      bestMove = move;
    }
    // if (alpha >= beta) {
    //   memory[move]["pruned"] = true;
    //   break;
    // }
  }

  if (isRoot) console.log(memory, rootMoves);
  return isRoot ? { score: bestScore, bestMove: bestMove, memory: memory } : bestScore;
}

function depth_first_start(state, depth) {
  // const oldstate = new Chess(state.fen());
  // let simulated;
  const moves = prune(state.moves(), depth);
  let max = MAX_NEG;
  let final_move = undefined;
  let memory = {};
  let analysis = [];

  for (const move of moves) {
    const simulated = new Chess(state.fen());
    simulated.move(move);
    d(move, depth - 1);
    memory[move] = { score: get_score(simulated) };
    let result = depth_first(simulated, depth - 1, memory[move], -Infinity, Infinity);
    let score = result * -1;
    analysis.push([score, move]);
    console.log("done with move", move);
    if (score >= max) {
      max = score;
      final_move = move;
    }
  }
  console.log(analysis, depth);
  console.log(memory, depth);
  console.log("Choice is: " + final_move, depth);
  return final_move;
}

function depth_first(state, depth, memory, alpha, beta) {
  if (depth == 0) {
    let score = get_score(state);
    memory["score"] = score;
    return score;
  }
  const moves = prune(state.moves(), depth);
  let max = -Infinity;

  for (const move of moves) {
    const simulated = new Chess(state.fen());
    simulated.move(move);
    d(move, depth - 1);
    memory[move] = { score: get_score(simulated) };
    let result = depth_first(simulated, depth - 1, memory[move], -beta, -alpha);
    let score = -1 * result;
    if (score > alpha) alpha = score;
    if (alpha > beta) {
      memory[move]["pruned"] = "PRUNED";
      // console.log("PRUNED", move);
      continue;
    }
    if (score > max) max = score;
  }

  d(memory, depth);
  return max;
}

function get_score(chess, sideChanged) {
  // console.log("get_score");
  let text = chess.fen().split(" ")[0].split("");
  let whitescore = 0;
  let blackscore = 0;
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

    if (chess.game_over()) points += 200;
    if (element == element.toLowerCase()) {
      blackscore += points;
    } else {
      whitescore += points;
    }
  }
  // console.log(whitescore, blackscore);
  // console.log((whitescore - blackscore) * (chess.turn() == "w" ? 1 : -1));
  return (whitescore - blackscore) * sideChanged;

  // return (whitescore - blackscore) * (chess.turn() == "w" ? 1 : -1);
}

function isNumber(char) {
  if (typeof char !== "string") {
    return false;
  }

  if (char.trim() === "") {
    return false;
  }

  return !isNaN(char);
}

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== "undefined") exports.Chess = Chess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== "undefined")
  define(function () {
    return evalMove;
  });
