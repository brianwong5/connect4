class Board {
  constructor (moves = []) {
    this.rows = 6;
    this.cols = 7;
    this.loadBoard(moves);
  }
  clone () {
    const b = new Board();
    b.loadBoard(this.moves.map(x => x + 1));
    return b;
  }
  reset () {
    // bitboard representation for each piece
    // 6 13 20 27 34 41 48
    // 5 12 19 26 33 40 47
    // 4 11 18 25 32 39 46
    // 3 10 17 24 31 38 45
    // 2  9 16 23 30 37 44
    // 1  8 15 22 29 36 43
    // 0  7 14 21 28 35 42
    this.bitboard = [BigInt(0), BigInt(0)];
    this.moves = [];
    this.heights = [...Array(this.cols)]
      .map((x, i) => BigInt(i * (this.rows + 1)));
  }
  get currentTurn () {
    return this.moves.length & 1;
  }
  isValidMove (col) {
    // console.log(col, typeof this.heights[col])
    const topMask = BigInt(0b1000000100000010000001000000100000010000001000000);
    return (topMask & (BigInt(1) << this.heights[col])) === BigInt(0);
  }
  isWinningMove (col) {
    // const b = this.clone();
    // b.makeMove(col);
    // return b.isWin(this.currentTurn);
    this.makeMove(col);
    const win = this.isWin(this.currentTurn ^ 1);
    this.undo();
    return win;
  }
  generateMoves () {
    const moveOrder = [3, 2, 4, 1, 5, 0, 6];
    return moveOrder.filter(x => this.isValidMove(x));
  }
  makeMove (col) {
    if (!this.isValidMove(col) || this.isGameOver()) {
      return false;
    }
    const move = BigInt(1) << this.heights[col]++;
    this.bitboard[this.currentTurn] ^= move;
    this.moves.push(col);
    return true;
  }
  undo () {
    if (this.moves.length === 0) return false;
    const col = this.moves.pop();
    const move = BigInt(1) << --this.heights[col];
    this.bitboard[this.currentTurn] ^= move;
    return true;
  }
  // array of 1 indexed moves
  loadBoard (moves) {
    this.reset();
    moves.forEach(move => this.makeMove(move - 1));
  }
  isWin (piece) {
    const b = this.bitboard[piece];
    return [1, 6, 7, 8]
      .map(x => BigInt(x))
      .some(x => (b & (b >> x) & (b >> (BigInt(2) * x)) & (b >> (BigInt(3) * x))) !== BigInt(0));
  }
  isDraw () {
    return this.moves.length === 42;
  }
  isGameOver () {
    return this.isWin(0) || this.isWin(1) || this.isDraw();
  }
  toArrayPadded () {
    // 0 = empty, 1 = red, 2 = yellow
    const reds = this.bitboard[0].toString(2).padStart(49, 0);
    const yellows = this.bitboard[1].toString(2).padStart(49, 0);
    return [...Array(49)]
      .fill(0)
      .map((x, i) => {
        if (reds[i] === "1") return 1;
        else if (yellows[i] === "1") return 2;
        return 0;
      });
  }
  toArray () {
    return this.toArrayPadded().filter((x, i) => i % 7 !== 6);
  }
  toString () {
    return this.toArray().join("");
  }
  toKey () {
    return Number(this.bitboard[this.currentTurn] + (this.bitboard[0] | this.bitboard[1]));
  }
  moveString () {
    return this.moves.map(x => x + 1).join("");
  }
  toReadable () {
    const output = [...Array(6)].map(() => []);
    const arr = this.toArray().reverse();
    for (let i = 0; i < arr.length; ++i) {
      output[5 - i % 6].push(arr[i]);
    }
    return output;
  }
}

module.exports = Board;
