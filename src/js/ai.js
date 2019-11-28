/**
 * Count number of pieces a player has played.
 *
 * @param {number} bitboard - Bitboard representing a player
 * @return {number} Number of pieces played
 */
const countPieces = bitboard =>
  bitboard.toString(2).split("").filter(x => x === "1").length;

/**
 * Heuristic used for negamax, counts number of spaces each player can win.
 *
 * @param {object} board - The board.
 * @return {number} Number of winning spaces for current player.
 */
const countWinningSpaces = board => {
  const player = board.currentTurn;
  let winningSpaces = 0;
  const p = board.bitboard[player];
  const o = board.bitboard[player ^ 1];
  const topMask = BigInt(0b1000000100000010000001000000100000010000001000000);
  const emptySpaces = ~(p | o | topMask);
  for (let i = BigInt(0); i < 49; ++i) {
    if ((emptySpaces >> i) & BigInt(1)) {
      const move = BigInt(1) << i;
      board.bitboard[player] ^= move;
      if (board.isWin(player)) {
        ++winningSpaces;
      }
      board.bitboard[player] ^= move;
    }
  }
  return winningSpaces;
}

/**
 * Assign a score to the current board from the current player's perspective.
 *
 * @param {object} board - The board.
 * @return {number} Score for the board.
 */
const evaluate = board => {
  const player = board.currentTurn;
  const opponent = player ^ 1;
  const pCount = countPieces(board.bitboard[player]);
  const oCount = countPieces(board.bitboard[opponent]);
  if (board.isWin(player)) {
    return (22 - pCount) * 10;
  }
  if (board.isWin(opponent)) {
    return (oCount - 22) * 10;
  }
  if (board.isDraw()) return 0;
  return countWinningSpaces(board);
}

const table = new TranspositionTable();

/**
 * Negamax implementation of minimax with alpha beta pruning and transposition tables.
 *
 * @param {object} node - The board.
 * @param {number} depth - How deep to search.
 * @param {number} alpha - Alpha value.
 * @param {number} beta - Beta value.
 * @param {object} time - Time limit.
 * @return {array} The best move and score for that move.
 */
const negamax = (node, depth, alpha, beta, time = {timeLimit: 0}) => {
  // console.log("negamax", node.moveString(), depth, alpha, beta)
  const alphaO = alpha;
  let newAlpha = alpha;
  let newBeta = beta;

  // transposition table lookup
  const key = node.toKey();
  const entryOut = table.get(key);
  if (entryOut !== undefined && entryOut.depth >= depth && entryOut.key === key) {
    switch (entryOut.flag) {
      case "EXACT":
        return [entryOut.move, entryOut.value];
      case "LOWERBOUND":
        newAlpha = Math.max(newAlpha, entryOut.value);
        break;
      case "UPPERBOUND":
        newBeta = Math.min(newBeta, entryOut.value);
        break;
    }
    if (newAlpha >= newBeta) {
      return [entryOut.move, entryOut.value];
    }
  }

  // base case
  if (depth === 0 || node.isGameOver()) {
    return [-1, evaluate(node)];
  }

  // recursive case
  let bestValue = -Infinity;
  let bestMove = -1;
  for (const move of node.generateMoves()) {
    if (time.timeLimit !== 0 && new Date() - time.start > time.timeLimit) {
      return [undefined, undefined];
    }
    node.makeMove(move);
    const result = -negamax(node, depth - 1, -newBeta, -newAlpha, time)[1];
    node.undo();
    if (result > bestValue) [bestValue, bestMove] = [result, move];
    newAlpha = Math.max(newAlpha, bestValue);
    if (newAlpha >= newBeta) break;
  }

  // transposition table store
  const entryIn = {value: bestValue, move: bestMove, depth, key}
  if (bestValue <= alphaO) entryIn.flag = "UPPERBOUND";
  else if (bestValue >= newBeta) entryIn.flag = "LOWERBOUND";
  else entryIn.flag = "EXACT";
  table.set(node.toKey(), entryIn);

  return [bestMove, bestValue];
}
/**
 * Calculate best move for a given board, using minimax and iterative deepening.
 *
 * @param {object} board - The board.
 * @param {number} [timeLimit=1000] - Time limit for iterative deepening.
 * @return {number} Best move found.
 */
const getBestMove = (board, timeLimit = 1000) => {
  // minimax algorithm (negamax) with iterative deepening
  const maxDepth = 42 - board.moves.length;
  const start = new Date();
  let bestMove;
  let bestScore;
  for (let depth = Math.min(2, maxDepth);; depth += 2) {
  // for (let depth = 1;; ++depth) {
    let [move, score] = negamax(board, depth, -Infinity, Infinity, {timeLimit, start});
    console.log(`depth ${depth} got`, move, score);
    if (move !== undefined && score !== undefined) {
      [bestMove, bestScore] = [move, score];
    }
    if (new Date() - start > timeLimit) {
      return bestMove;
    }
    if (depth >= maxDepth) {
      console.log("max depth reached");
      return bestMove;
    }
  }
  // shouldn't get here but just in case
  return negamax(board, 6, -Infinity, Infinity)[0];
}

module.exports = {
  evaluate,
  getBestMove
};
