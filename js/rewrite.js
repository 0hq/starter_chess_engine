const DEPTH_SEARCH = 4;
const DO_QUIESCENCE = true;
const USE_HASHING = true;
const DEPTH_MAX = -Infinity;
const DO_ITERATIVE_DEEPENING = true;
const STRICT_TIMING = false;
const SEARCH_TIME = 5;
const QUIESCENCE_MULTIPLIER = 2;
const DO_LOGGING = true;
let searchDepthTemp = 0;
let startTime = null;
let nodesExplored = 0;
let quiescenceExplored = 0;
let hashCount = 0;
let rootHistory = [];
let currentEval = 0;
// let memo = {};

var _privateLog = console.log;
// Redefine console.log method with a custom function
console.log = function (message) {
  // Here execute something with the given message or arguments variable
  if (DO_LOGGING) {
    var logger = document.getElementById("logger");
    if (typeof message == "object") {
      logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
    } else {
      logger.innerHTML += message + "<br />";
    }
  }
  _privateLog.apply(console, arguments);
};

// ISSUES
// Strict timing fucks up evaluation in a weird way
// Move saving seems to have gone wrong somehow? - this is just zobrist keys and en passant
// Actualy quiescence search is messed up by some move saving - seems to completely misrepresent board. Make hashes save PGN then you can load and check.
// Weird null evaluation return
// Seems to be a bug in the way

var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000 };
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
  let move = DO_ITERATIVE_DEEPENING ? evaluate_iteratively(chess, isMax) : evaluate(chess, isMax);
  o(move.san);
  o("\n");
  return move;
}

function evaluate(chess, isMax) {
  let moves = chess.moves();
  console.log("All moves", prune(chess, false, true));
  console.log("");

  const start = new Date();
  startTime = start;
  currentEval = evaluatePositionState(chess);

  const [move, eval, history] = minimaxAlphaBetaHashing(chess, DEPTH_SEARCH, -Infinity, Infinity, isMax, null, currentEval, true);

  rootHistory.sort((a, b) => b[1] - a[1]);
  rootHistory = rootHistory.map((x) => x[0] + ": " + x[1]);
  let value = ((eval - currentEval) / 100).toFixed(2);
  let string = value >= 0 ? "+" : "";
  console.log(`! best move: ${move.san} eval: ${string + value} (${eval}) !`);
  console.log(`path taken: ${history}`);

  const end = new Date();
  console.log(`Time taken in secs: ${(end - start) / 1000}`);
  console.log(`Nodes explored is ${nodesExplored}`);
  console.log(`Quiescence nodes: ${quiescenceExplored}`);
  console.log(`hashes used: ${hashCount}`);
  console.log(`moves evaluated:`, rootHistory);

  // console.log(`zobrist hash: ${zobrist(chess, false)}`);

  return move;
}

function evaluate_iteratively(chess, isMax) {
  let moves = chess.moves({ verbose: "true" });
  console.log("All moves", prune(chess, moves, false, false));
  console.log("");

  const start = new Date();
  startTime = start;
  currentEval = evaluatePositionState(chess);

  let totalNodesExplored = 0;
  let totalQuiescence = 0;
  let totalHashCount = 0;

  let move, eval, history;
  let depth = 0;
  while (new Date(start.getTime() + 1000 * SEARCH_TIME) - new Date() > 0) {
    depth++;
    rootHistory = [];
    nodesExplored = 0;
    searchDepthTemp = depth;
    quiescenceExplored = 0;
    hashCount = 0;
    console.log(`DEPTH SEARCH: ${depth}`);
    console.log(`time left ${((new Date(start.getTime() + 1000 * SEARCH_TIME) - new Date()) / 1000).toFixed(2)} seconds`);

    [move, eval, history] = minimaxAlphaBetaHashing(chess, depth, -Infinity, Infinity, isMax, null, currentEval, true);

    rootHistory.sort((a, b) => b[1] - a[1]);
    rootHistory = rootHistory.map((x) => x[0] + ": " + x[1]);
    let value = ((eval - currentEval) / 100).toFixed(2);
    let string = value >= 0 ? "+" : "";
    console.log(`! best move: ${move.san} eval: ${string + value} (${eval}) !`);
    console.log(`path taken: ${history}`);

    let end = new Date();
    console.log(`Time taken in secs: ${(end - start) / 1000}`);
    console.log(`Nodes explored is ${nodesExplored}, global: ${totalNodesExplored}`);
    console.log(`Quiescence nodes: ${quiescenceExplored}, global: ${totalQuiescence} `);
    console.log(`hashes used: ${hashCount}, global: ${totalHashCount}`);
    console.log(`moves evaluated:`, rootHistory);
    console.log(`time left ${((new Date(start.getTime() + 1000 * SEARCH_TIME) - new Date()) / 1000).toFixed(2)} seconds`);
    console.log("");
    console.log("");

    totalNodesExplored += nodesExplored;
    totalQuiescence += quiescenceExplored;
    totalHashCount += hashCount;
  }

  console.log(`Nodes explored is ${totalNodesExplored}`);
  console.log(`Quiescence nodes: ${totalQuiescence}`);
  console.log(`hashes used: ${totalHashCount}`);

  // console.log(`zobrist hash: ${zobrist(chess, false)}`);

  return move;
}

// fixed random seed
var randomState = 1804289383;

// generate 32-bit pseudo legal numbers
function random() {
  var number = randomState;

  // 32-bit XOR shift
  number ^= number << 13;
  number ^= number >> 17;
  number ^= number << 5;
  randomState = number;

  return number;
}

var zobristKeys = new Array(12 * 64);
var blackToMove;
var hashTable = [];

// init random hash keys
initRandomKeys();
function initRandomKeys() {
  console.log("initRandomKeys", zobristKeys);
  for (var index = 0; index < 12 * 64; index++) zobristKeys[index] = random();
  blackToMove = random();
}

console.log("");
console.log(`Settings:`);
if (DO_ITERATIVE_DEEPENING) {
  console.log(`Iterative deepening: ${DO_ITERATIVE_DEEPENING}`);
  console.log(`Strict timing? ${STRICT_TIMING}`);
  console.log(`Time control: ${SEARCH_TIME} seconds`);
} else {
  console.log(`Normal depth search at depth: ${DEPTH_SEARCH}`);
}
console.log(`Quiescence search?: ${DO_QUIESCENCE}`);
console.log(`Max quiescence depth: ${QUIESCENCE_MULTIPLIER}x current depth`);
console.log(`Use hashing: ${USE_HASHING}`);
console.log("");

// --------------------------- primitive stuff ----------

function zobrist(game, isMax) {
  const pieces_2d = game.board();
  let bits = 0;
  if (!isMax) bits ^= blackToMove;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const position = pieces_2d[y][x];
      // null if nothing there
      if (position) {
        let value = get_zobrist_value(x, y, piece_nums(position.type, position.color));
        bits ^= value;
      }
    }
  }
  return bits;
}

function get_zobrist_value(x, y, piece) {
  let offset = x + y * 8 + piece * 12;
  return zobristKeys[offset];
}

function read_hash(hash, alpha, beta, depth) {
  const entry = hashTable[hash & 0x7fffffff]; // makes always positive via binary operations
  if (entry?.hash === hash && USE_HASHING) {
    // check for conflicts
    hashCount++;
    if (entry.depth >= depth) {
      // console.log(`HASHED AT ${entry.depth} vs ${depth}`);
      var flag = entry.flag;
      var score = entry.score;
      if (flag == "EXACT") return [score, entry.bestMove, entry.moves];
      if (flag == "ALPHA" && score <= alpha) return [alpha, entry.bestMove, entry.moves]; // not fully understood yet
      if (flag == "BETA" && score >= beta) return [beta, entry.bestMove, entry.moves]; // not fully understood yet
    }
    return [null, entry.bestMove, entry.moves];
  }
  return [null, null, null];
}

function write_hash(hash, depth, flag, score, bestMove, moves) {
  if (!hashTable[hash & 0x7fffffff]) hashTable[hash & 0x7fffffff] = {};
  let entry = hashTable[hash & 0x7fffffff];
  entry.hash = hash;
  entry.depth = depth;
  entry.flag = flag;
  entry.score = score;
  entry.bestMove = bestMove.san;
  entry.moves = moves;
}

function prune(game, moves, isMax, doPrint = false) {
  let evaluated = [];
  let hashed = [];
  for (let i = 0; i < moves.length; i++) {
    let move = game.move(moves[i], { verbose: true }); // simulate the move
    // console.log(move.san);
    if (!move) {
      // this is usually an en passant or castling error
      console.log(move, moves[i]);
      console.log("ILLEGAL MOVE");
      console.log(game.ascii());
      console.log(game.moves({ verbose: true }));
      console.log(game.pgn());
      continue;
      // throw "illegal move";
    }
    const [score, bestHashMove, moveList] = read_hash(zobrist(game, !isMax), Infinity, -Infinity, -Infinity);
    // if (doPrint) console.log(moves[i].san, score, moveList, bestHashMove, zobrist(game, !isMax));
    game.undo();

    if (score) {
      hashed.push([moves[i], score]);
    } else {
      evaluated.push(evaluate_move(game, moves[i], isMax));
    }
  }
  evaluated.sort((a, b) => b[1] - a[1]);
  hashed.sort((a, b) => b[1] - a[1]);
  if (!isMax) hashed.reverse();
  // evaluated = evaluated.filter((x) => {
  //   return x[1] > -10;
  // });
  // if (hashed.length) console.log("HASHING", evaluated, hashed);

  let eval_map = evaluated.map((x) => x[0]);
  let hash_map = hashed.map((x) => x[0]);
  if (doPrint) {
    console.log(
      hashed.map((x) => [x[0].san, x[1]]),
      evaluated.map((x) => [x[0].san, x[1]])
    );
  }

  return hash_map.concat(eval_map).filter((x) => x);
}

function evaluate_move(game, move, isMax) {
  if (move.san.includes("#")) return Infinity;
  if (move.san.includes("=")) return 1000;

  let capture = 0;
  if (move.san.includes("x")) capture = evaluate_capture(game, move);

  let from = evaluate_piece(move.piece, move["from"][0], move["from"][1], isMax);
  let to = evaluate_piece(move.piece, move["to"][0], move["to"][1], isMax);
  let position = to - from;

  let value = position + capture;
  return [move, value];
}

function evaluate_piece(element, xL, yX, isMax) {
  let x = xL.charCodeAt(0) - 97;
  let y = 8 - parseInt(yX);
  // console.log(element, xL, x, yX, y, isMax);
  if (isMax) {
    return pst_w[element][y][x];
  } else {
    return pst_b[element][y][x];
  }
}

function evaluate_capture(board, move, isMax) {
  return weights[move["captured"]] - weights[move["piece"]];
}

function get_quiescence_moves(moves) {
  let checkmate = moves.filter((m) => m.san.includes("#"));
  let take = moves.filter((m) => m.san.includes("x"));
  let promote = moves.filter((m) => m.san.includes("="));
  return [...checkmate, ...take, ...promote];
}

function check_time_over() {
  if (DO_ITERATIVE_DEEPENING == false || !STRICT_TIMING) return false;
  return new Date(startTime.getTime() + 1000 * SEARCH_TIME) - new Date() <= 0;
}

function san(moves) {
  return moves.map((x) => x.san);
}

function minimaxAlphaBetaHashing(game, depth, alpha, beta, isMax, oldMove, oldSum, isRoot = false) {
  nodesExplored++;
  const [score, bestHashMove, hashMoves] = read_hash(zobrist(game, isMax), alpha, beta, depth);
  if (score && bestHashMove) return [bestHashMove, score, [bestHashMove + "-hash"]];
  // if (hashMoves) console.log(san(hashMoves));
  const move_gen = hashMoves?.length ? hashMoves : game.moves({ verbose: true });
  // const move_gen = game.moves({ verbose: true });
  const moves = prune(game, move_gen, isMax, isRoot);
  const sum = evaluatePosition(game, oldMove, oldSum);
  // if (isRoot) console.log(moves);
  if (check_time_over() && !isRoot) return [null, null, null];
  if (moves.length === 0 || check_time_over() || (depth <= 0 && !DO_QUIESCENCE) || depth < searchDepthTemp * -1 * QUIESCENCE_MULTIPLIER) {
    // if (depth < 2) console.log(zobrist(game, isMax), depth, "EXACT", sum, oldMove, null);
    write_hash(zobrist(game, isMax), depth, "EXACT", sum, oldMove, null);
    return [null, sum, []];
  }
  if (depth <= 0) {
    // const quiescence_moves = get_quiescence_moves(move_gen);
    const quiescence_moves = get_quiescence_moves(game.moves({ verbose: true }));
    if (quiescence_moves.length === 0) {
      write_hash(zobrist(game, isMax), depth, "EXACT", sum, oldMove, null);
      return [null, sum, []];
    }
    return quiesce(game, isMax, alpha, beta, depth, sum, quiescence_moves, oldMove);
  }

  let eval,
    history = [],
    bestMove = null;
  if (isMax) {
    eval = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const moved = game.move(move, { verbose: true }); // simulate the move
      if (!moved) {
        console.log(move, moved);
        console.log("ILLEGAL MOVE");
        console.log(game.ascii());
        console.log(game.moves({ verbose: true }));
        console.log(game.pgn());
        throw "illegal move";
      }
      let [r, evaluation, rHist] = minimaxAlphaBetaHashing(game, depth - 1, alpha, beta, !isMax, moved, sum);
      game.undo(); // revert the simulated move
      if (evaluation === null) continue;
      if (evaluation > eval) {
        eval = evaluation;
        bestMove = moved;
        history = [moved.san, ...rHist];
      }
      if (eval > alpha) alpha = eval;
      if (alpha >= beta) {
        write_hash(zobrist(game, isMax), depth, "ALPHA", alpha, bestMove);
        break;
      }
    }
  } else {
    eval = Infinity;
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const moved = game.move(move, { verbose: true });
      if (!moved) {
        console.log(move, moved, moves);
        console.log("ILLEGAL MOVE");
        console.log(game.ascii());
        console.log(game.moves({ verbose: true }));
        console.log(game.pgn());
        throw "illegal move";
      }
      let [r, evaluation, rHist] = minimaxAlphaBetaHashing(game, depth - 1, alpha, beta, !isMax, moved, sum);
      game.undo();
      if (evaluation === null) continue;
      if (evaluation < eval) {
        eval = evaluation;
        bestMove = moved;
        history = [moved.san, ...rHist];
      }
      if (eval < beta) beta = eval;
      if (beta <= alpha) {
        write_hash(zobrist(game, isMax), depth, "BETA", beta, bestMove);
        break;
      }
      if (isRoot) {
        let value = ((evaluation - currentEval) / 100).toFixed(2);
        let string = value >= 0 ? "+" : "";
        console.log(`move: ${moved.san} eval: ${string + value} (${evaluation})`);
        console.log([moved.san, ...rHist]);
        console.log(`current node #: ${nodesExplored} hash #: ${hashCount}`);
        console.log("");
        rootHistory.push([moved.san, evaluation]);
      }
    }
  }

  if (bestMove?.san) {
    write_hash(zobrist(game, isMax), depth, "EXACT", eval, bestMove, moves);
    return [bestMove, eval, history];
  } else {
    write_hash(zobrist(game, isMax), depth, "EXACT", sum, oldMove, null);
    return [null, sum, []];
  }
}

// fixes horizon issue
function quiesce(game, isMax, alpha, beta, depth, sum, moves, lastMove) {
  quiescenceExplored++;
  let eval,
    history = [],
    bestMove = null;
  // console.log(depth - 1);
  if (isMax) {
    eval = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      let move = moves[i];
      let moved = game.move(move, { verbose: true }); // simulate the move
      let [r, evaluation, rHist] = minimaxAlphaBetaHashing(game, depth - 1, alpha, beta, !isMax, move, sum);
      game.undo(); // revert the simulated move
      if (evaluation === null) continue;
      if (evaluation > eval) {
        eval = evaluation;
        bestMove = moved;
        history = [moved.san + "-q", ...rHist];
      }
      if (eval > alpha) alpha = eval;
      if (alpha >= beta) {
        write_hash(zobrist(game, isMax), depth, "ALPHA", alpha, bestMove);
        break;
      }
    }
    if (eval >= sum) return [bestMove, eval, history];
    else return [null, sum, []];
  } else {
    eval = Infinity;
    for (let i = 0; i < moves.length; i++) {
      let move = moves[i];
      let moved = game.move(move, { verbose: true });
      if (!moved) {
        console.log(move, moved, moves);
        console.log("ILLEGAL MOVE");
        console.log(game.ascii());
        console.log(game.moves({ verbose: true }));
        console.log(game.pgn());
        throw "illegal move";
      }
      let [r, evaluation, rHist] = minimaxAlphaBetaHashing(game, depth - 1, alpha, beta, !isMax, move, sum);
      game.undo();
      if (evaluation === null) continue;
      if (evaluation < eval) {
        eval = evaluation;
        bestMove = moved;
        history = [moved.san + "-q", ...rHist];
      }
      if (eval < beta) beta = eval;
      if (beta <= alpha) {
        write_hash(zobrist(game, isMax), depth, "BETA", beta, bestMove);
        break;
      }
    }

    if (bestMove?.san) {
      write_hash(zobrist(game, isMax), depth, "EXACT", eval, bestMove, moves);
      if (eval <= sum) return [bestMove, eval, history];
      else return [null, sum, []];
    } else {
      write_hash(zobrist(game, isMax), depth, "EXACT", sum, lastMove, null);
      return [null, sum, []];
    }
  }
}

function evaluatePosition(chess, move, score) {
  if (!move) {
    console.log("EVALUATION VIA STATE");
    return evaluatePositionState(chess);
  }
  let flip, position, positionOpponent;

  // console.log(chess, score, move);
  if (move.color === "w") {
    flip = 1;
    position = pst_w;
    positionOpponent = pst_b;
  } else {
    flip = -1;
    position = pst_b;
    positionOpponent = pst_w;
  }
  if (chess.in_checkmate()) {
    return 10 ** 10 * flip;
  }

  if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()) {
    return 0;
  }

  if (game.in_check()) {
    score += 50 * flip;
  }

  var from = [8 - parseInt(move["from"][1]), move["from"].charCodeAt(0) - "a".charCodeAt(0)];
  var to = [8 - parseInt(move["to"][1]), move["to"].charCodeAt(0) - "a".charCodeAt(0)];

  if ("captured" in move) {
    score += flip * (weights[move.captured] + positionOpponent[move.captured][to[0]][to[1]]);
  }

  if (move.flags.includes("p")) {
    // if promotion
    move.promotion = "q";
    score -= flip * (weights[move.piece] + position[move.piece][from[0]][from[1]]);
    score += flip * (weights[move.promotion] + position[move.promotion][to[0]][to[1]]);
  } else {
    // normal move
    score -= flip * position[move.piece][from[0]][from[1]];
    score += flip * position[move.piece][to[0]][to[1]];
  }

  return score;
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

function evaluatePositionState(chess) {
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
    points = weights[lower];
    element == lower ? (blackscore += points) : (whitescore += points);
  }
  return whitescore - blackscore;
}

function evaluatePositionOld(chess) {
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

function piece_nums(piece, color) {
  let offset = color == "w" ? 0 : 6;
  let value = 0;
  switch (piece) {
    case "p":
      value = 0;
    case "r":
      value = 1;
    case "n":
      value = 2;
    case "b":
      value = 3;
    case "q":
      value = 4;
    case "k":
      value = 5;
  }
  return offset + value;
}

// function minimaxAlphaBetaOld(startingState, depth, moves, alpha, beta, maximizingPlayer, isRoot = false) {
//   if (depth <= 0 || moves.length === 0) {
//     return [null, evaluatePosition(startingState), []];
//     // console.log("quiesce", maximizingPlayer, startingState.ascii());
//     let result = quiesce(startingState, maximizingPlayer, alpha, beta, depth);
//     // console.log("quiesce done", nodes);
//     return result;
//     return [null, evaluatePosition(startingState)];
//   }
//   // console.log("-".repeat(DEPTH_SEARCH - depth));

//   if (maximizingPlayer) {
//     let maxEval = -Infinity, // minimum value, so that anything will be larger
//       bestMove = null,
//       history = [];
//     for (let index = 0; index < moves.length; index++) {
//       let move = moves[index];
//       startingState.move(move); // simulate the move
//       // aiboard.position(startingState.fen());
//       // evaluate one more down, with the opposite player OR if it's done, just return evaluation
//       let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, prune(startingState), alpha, beta, false);

//       startingState.undo(); // revert the simulated move

//       // if this move is better than anything seen before, keep it!
//       if (evaluation > maxEval) {
//         maxEval = evaluation;
//         bestMove = move;
//         history = [move, ...returnedHistory];
//       }
//       if (maxEval > alpha) {
//         alpha = maxEval;
//       }
//       if (alpha >= beta) {
//         break;
//       }
//     }
//     // console.log([bestMove, maxEval, history]);
//     return [bestMove, maxEval, history];
//   } else {
//     // if this is the enemy playing, we're looking to minimize!
//     let minEval = Infinity, // maximum value, so that anything will be smaller
//       bestMove = null,
//       history = [];
//     for (let index = 0; index < moves.length; index++) {
//       const move = moves[index];
//       startingState.move(move); // simulate the move

//       // evaluate one more down, with the opposite player OR if it's done, just return evaluation
//       let [returnedMove, evaluation, returnedHistory] = minimaxAlphaBeta(startingState, depth - 1, prune(startingState), alpha, beta, true);

//       startingState.undo(); // revert the simulated move

//       if (isRoot) {
//         console.log("root move done:", evaluation);
//         console.log(move, returnedHistory);
//       }

//       // if this move is better than anything seen before, keep it!
//       if (evaluation < minEval) {
//         minEval = evaluation;
//         bestMove = move;
//         history = [move, ...returnedHistory];
//       }
//       if (minEval < beta) {
//         beta = minEval;
//       }
//       if (beta <= alpha) {
//         break;
//       }
//     }
//     // console.log([bestMove, minEval, history]);
//     return [bestMove, minEval, history];
//   }
// }

// function minimaxAlphaBeta(game, depth, alpha, beta, isMax, sum, isRoot = false) {
//   nodesExplored++;
//   let moves;
//   // if (depth < 0) console.log(depth);
//   // if (depth == 3) moves = prune(game, isMax, true);
//   moves = prune(game, isMax);
//   // if (isRoot) moves = ["Qg3"];
//   let eval,
//     history = [],
//     bestMove = null;
//   // if (depth <= 0 || moves.length === 0) return [null, sum, []];
//   if (depth <= 0 || moves.length === 0) return quiesce(game, isMax, alpha, beta, depth, sum);
//   if (isMax) {
//     eval = -Infinity;
//     for (let i = 0; i < moves.length; i++) {
//       let move = moves[i];
//       let moved = game.move(move, { verbose: true }); // simulate the move
//       var newSum = evaluatePosition(game, moved, sum);
//       let [r, evaluation, rHist] = minimaxAlphaBeta(game, depth - 1, alpha, beta, !isMax, newSum);
//       game.undo(); // revert the simulated move
//       if (evaluation > eval) {
//         eval = evaluation;
//         bestMove = moved;
//         history = [moved.san, ...rHist];
//       }
//       if (eval > alpha) alpha = eval;
//       if (alpha >= beta) break;
//     }
//   } else {
//     eval = Infinity;
//     for (let i = 0; i < moves.length; i++) {
//       let move = moves[i];
//       let moved = game.move(move, { verbose: true });
//       var newSum = evaluatePosition(game, moved, sum);
//       let [r, evaluation, rHist] = minimaxAlphaBeta(game, depth - 1, alpha, beta, !isMax, newSum);
//       game.undo();
//       if (evaluation < eval) {
//         eval = evaluation;
//         bestMove = moved;
//         history = [moved.san, ...rHist];
//       }
//       if (eval < beta) beta = eval;
//       if (beta <= alpha) break;
//       if (isRoot) {
//         let value = ((evaluation - currentEval) / 100).toFixed(2);
//         let string = value >= 0 ? "+" : "";
//         console.log(`move: ${moved.san} eval: ${string + value} (${evaluation})`);
//         console.log([moved.san, ...rHist]);
//         console.log("");
//         rootHistory.push([moved.san, evaluation]);
//       }
//     }
//   }
//   return [bestMove, eval, history];
// }
