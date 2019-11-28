// define elements
const boardGUI = document.querySelector("#board");
const history = document.querySelector("#history");
const aiOutput = document.querySelector("#ai");
const newBtn = document.querySelector("#new");
const undoBtn = document.querySelector("#undo");
const moveBtn = document.querySelector("#move");
const thinkingTime = document.querySelector("#time");
const turnOutput = document.querySelector("#turn");

const board = new Board();

const worker = new Worker("js/worker.js");
worker.onmessage = e => {
  const {move, method} = e.data;
  aiOutput.textContent = `${method}: ${move + 1}`;
  makeMove(move);
  enableGUI();
}

const enableGUI = () => {
  document.querySelectorAll(".cell").forEach(x => x.addEventListener("click", GUImove));
  newBtn.addEventListener("click", newGame);
  undoBtn.addEventListener("click", GUIundo);
  moveBtn.addEventListener("click", AImove);
}

const disableGUI = () => {
  document.querySelectorAll(".cell").forEach(x => x.removeEventListener("click", GUImove));
  newBtn.removeEventListener("click", newGame);
  undoBtn.removeEventListener("click", GUIundo);
  moveBtn.removeEventListener("click", AImove);
}

const resetGUI = () => {
  boardGUI.innerHTML = "";
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLUMNS; ++col) {
      const cell = document.createElement("div");
      cell.classList.add("cell", `col${col % COLUMNS + 1}`);
      // cell.addEventListener("click", GUImove)
      boardGUI.appendChild(cell);
    }
  }
  enableGUI();
}

const updateHistory = () =>
  history.textContent = board.moves.map(x => x + 1).join("");

const newGame = () => {
  board.reset();
  worker.postMessage("reset");
  resetGUI();
  updateGUI();
}

const createDisc = (row, col, colour, animated) => {
  const disc = document.createElement("div");
  disc.classList.add("disc", COLOURS[colour]);
  disc.style.left = `${col * 100 / COLUMNS}%`;
  disc.animate(
    [
      {top: `${-100 / ROWS}%`},
      {top: `${(row - 1) * 100 / ROWS}%`}
    ], {
      fill: "forwards",
      easing: "ease-in",
      duration: animated ? (row * 100) : 0
    }
  );
  return disc;
}

const updateTurnOutput = () => turnOutput.textContent = COLOURS[board.currentTurn];

const updateGUI = () => {
  const numDiscs = boardGUI.childElementCount - (ROWS * COLUMNS);
  for (let i = numDiscs; i < board.moves.length; ++i) {
    const col = board.moves[i];
    const row = ROWS + 1 - board.moves.reduce((acc, cur, x) =>
      cur === col && x <= i ? acc + 1 : acc, 0);
    const colour = i & 1;
    const animate = i === board.moves.length - 1;
    boardGUI.appendChild(createDisc(row, col, colour, animate));
  }
  updateHistory();
  updateTurnOutput();
  if (board.isGameOver()) {
    if (board.isWin(0)) console.log(`${COLOURS[0]} wins.`);
    else if (board.isWin(1)) console.log(`${COLOURS[1]} wins.`);
    else if (board.isDraw()) console.log("draw");
  }
}

const makeMove = col => {
  if (board.isGameOver() || !board.makeMove(col)) return false;
  updateGUI();
  return true;
}

const AImove = () => {
  if (board.isGameOver()) return;
  aiOutput.textContent = "calculating move";
  disableGUI();
  worker.postMessage({
    moves: board.moveString(),
    time: parseInt(thinkingTime.value) || 1000
  });
}

const GUImove = ({target}) => {
  if (makeMove([...target.classList].find(x => x.startsWith("col"))[3] - 1)) {
    AImove();
  }
}

const GUIundo = () => {
  if (board.undo()) {
    boardGUI.lastChild.remove();
    updateGUI();
  }
}

const GUIload = string => {
  newGame();
  board.loadBoard(
    string.split("")
    .filter(x => !isNaN(parseInt(x)))
    .map(x => parseInt(x)));
  updateGUI();
}

window.addEventListener("load", newGame);
