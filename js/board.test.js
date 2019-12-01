const Board = require("./board");

describe("Board", () => {
  test("initialise new board", () => {
    const board = new Board();

    // check first turn
    expect(board.currentTurn).toEqual(0);

    // each spot should be a valid move
    for (let i = 0; i < 7; ++i) {
      expect(board.isValidMove(i)).toBeTruthy();
    }
    const arr = [...Array(42)].fill(0);
    expect(board.toArray()).toStrictEqual(arr);

    expect(board.isDraw()).toBeFalsy();
    expect(board.isWin(0)).toBeFalsy();
    expect(board.isWin(1)).toBeFalsy();
  });
  test("making a move", () => {
    const board = new Board();
    board.makeMove(0);
    expect(board.bitboard[0]).toEqual(BigInt(1));
    expect(board.bitboard[1]).toEqual(BigInt(0));
    board.makeMove(3);
    expect(board.bitboard[0]).toEqual(BigInt(1));
    expect(board.bitboard[1]).toEqual(BigInt(1 << 21));
  });
  test("no more moves", () => {
    const board = new Board();
    board.makeMove(0);
    board.makeMove(0);
    board.makeMove(0);
    board.makeMove(0);
    board.makeMove(0);
    expect(board.isValidMove(0)).toBeTruthy();
    board.makeMove(0);
    expect(board.isValidMove(0)).toBeFalsy();
  });
  test("loadBoard", () => {
    const board = new Board();
    board.loadBoard([1, 2, 3]);
    expect(board.bitboard[0]).toEqual(BigInt(1 | 1 << 14));
    expect(board.bitboard[1]).toEqual(BigInt(1 << 7));
  });
  test("draw", () => {
    const board = new Board();
    const moves = [
      1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5,
      5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 4];
    board.loadBoard(moves);
    expect(board.isDraw()).toBeFalsy();
    board.makeMove(2);
    expect(board.isDraw()).toBeTruthy();
  });
  test("win vertical", () => {
    const board = new Board();
    board.loadBoard([1, 2, 1, 2, 1, 2]);
    expect(board.isWin(0)).toBeFalsy();
    board.makeMove(0);
    expect(board.isWin(0)).toBeTruthy();
  });
  test("win horizontal", () => {
    const board = new Board();
    board.loadBoard([1, 1, 2, 2, 3, 3]);
    expect(board.isWin(0)).toBeFalsy();
    board.makeMove(3);
    expect(board.isWin(0)).toBeTruthy();
  });
  test("win diagonal 1", () => {
    const board = new Board();
    board.loadBoard([1, 2, 3, 4, 4, 3, 2, 4, 3, 5]);
    expect(board.isWin(0)).toBeFalsy();
    board.makeMove(3);
    expect(board.isWin(0)).toBeTruthy();
  });
  test("win diagonal 2", () => {
    const board = new Board();
    board.loadBoard([6, 5, 4, 3, 3, 4, 5, 3, 4, 2]);
    expect(board.isWin(0)).toBeFalsy();
    board.makeMove(2);
    expect(board.isWin(0)).toBeTruthy();
  });
});
