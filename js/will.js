const DEPTH_SEARCH = 3;

const chess = new Chess(
  "rn1qkbnr/p2bp1pp/3p1p2/1pp5/8/8/PPPPPPPP/1RBQKBNR w Kkq c6 0 6"
);

var logger = document.getElementById("logger");
o = function (message) {
  if (typeof message == "object") {
    logger.innerHTML +=
      (JSON && JSON.stringify ? JSON.stringify(message) : message) + "<br />";
  } else {
    logger.innerHTML += message + "<br />";
  }
};

function evalMove(chess) {
  o("--- AI MOVE ---");
  let move = evaluate(chess);
  o(move);
  return move;
}

function main() {
  let games = 0;
  let max = 10;
  let score = [0, 0, 0]; // win draw losses
  while (games < max + 1) {
    // o('\n')
    o(games);
    // let result = Math.random() > 0.5 ? run_game('w') : run_game('b')
    let result = run_game("w");
    score[result] += 1;
    games++;
  }

  o(`Wins: ${score[0]}, Draws: ${score[1]}, Losses: ${score[2]}`);
}

function run_game(agent) {
  const chess = new Chess();

  // while (!chess.game_over()) {
  // let move = agent == chess.turn() ? evaluate(chess) : baseline(chess)
  let move = evaluate(chess);

  chess.move(move);
  o(chess.fen());
  o(chess.pgn());
  // }

  o(chess.pgn());

  if (chess.in_draw() || chess.in_stalemate()) {
    o("Draw");
    return 1;
  }

  if (chess.in_checkmate()) {
    let loser = chess.turn();
    o(`${loser} has lost with score: ${get_score(chess)}`);
    return loser == agent ? 2 : 0;
  }

  throw "shouldn't be here at the end of run game";
}

function baseline(chess) {
  let moves = chess.moves();
  let random = moves[Math.floor(Math.random() * moves.length)];
  return random;
}

// --------------------------- primitive stuff ----------

function evaluate(chess) {
  let moves = chess.moves();
  // return really_dumb_evaluate(moves)
  let castle = moves.find((m) => m.includes("O-O")); // if not in danger
  if (castle) return castle;

  return depth_first_start(chess, DEPTH_SEARCH);
}

function good_moves(moves, limit = 10) {
  let checkmate = moves.filter((m) => m.includes("#"));
  let promote = moves.filter((m) => m.includes("="));
  let castle = moves.filter((m) => m.includes("O-O"));
  let take = moves.filter((m) => m.includes("x"));
  let check = moves.filter((m) => m.includes("+"));
  let random = [];
  for (let index = 0; index < 10; index++) {
    random.push(moves[Math.floor(Math.random() * moves.length)]);
  }

  // o([...checkmate, ...promote, ...castle, ...take, ...random])
  return [...checkmate, ...promote, ...castle, ...take, ...random].slice(0, 5);
}

function really_dumb_evaluate(moves) {
  let checkmate = moves.find((m) => m.includes("#"));
  let promote = moves.find((m) => m.includes("="));
  let castle = moves.find((m) => m.includes("O-O"));
  let take = moves.find((m) => m.includes("x"));
  let check = moves.find((m) => m.includes("+"));
  let random = moves[Math.floor(Math.random() * moves.length)];
  if (checkmate) return checkmate;
  if (promote) return promote;
  if (castle) return castle;
  if (take) return take;
  if (check) return check;
  return random;
}

function doubled_isolated_blocked(chess) {}

function mobility(chess) {
  return chess.moves().length;
}

function depth_first_start(state, depth) {
  let start = new Date();
  const moves = good_moves(state.moves(), 15);
  let max = -1000000000;
  let final_move = undefined;
  // let memory = []
  o(
    `${get_score(state)} depth_first_start has this many moves ${moves.length}`
  );
  for (let index = 0; index < moves.length; index++) {
    const move = moves[index];
    // o("\n New loop for", move, index)
    const simulated = new Chess(state.fen());
    simulated.move(move);
    let score = -1 * depth_first(simulated, depth - 1);
    // o(`score for move: ${move}  is ${score}`)
    // memory.push([score, move])
    if (score > max) {
      // o("saving", score, move)
      max = score;
      final_move = move;
    }
  }
  let end = new Date();

  // o(max, final_move, memory)
  o((end - start) / 1000);
  return final_move;
}

function depth_first(state, depth) {
  if (depth == 0) return get_score(state);
  const moves = good_moves(state.moves(), 3 + depth);
  let max = -1000000000;
  // o(`${depth} depth_first_start has this many moves ${moves.length}`)
  for (let index = 0; index < moves.length; index++) {
    const move = moves[index];
    // o("\n New loop for", move, index)
    const simulated = new Chess(state.fen());
    simulated.move(move);
    let score = -1 * depth_first(simulated, depth - 1);
    // o(`score for move: ${move}  is ${score}`)
    if (score > max) {
      // o("saving", score)
      max = score;
    }
  }

  // o(max)
  return max;
}

function get_score(chess) {
  // o("get_score")
  let text = chess.fen().split(" ")[0].split("");
  let whitescore = 0;
  let blackscore = 0;
  let chars = text.filter((char) => {
    return char.length === 1 && char.match(/[a-z]/i);
  });
  // o(chars)
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
    element == element.toLowerCase()
      ? (blackscore += points)
      : (whitescore += points);
  }
  // o(whitescore, blackscore)
  // o((whitescore - blackscore) * (chess.turn() == 'w' ? 1 : -1))
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
  return (whitescore - blackscore) * (chess.turn() == "w" ? 1 : -1);
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
