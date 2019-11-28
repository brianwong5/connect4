require=()=>({}); module={}; module.exports=()=>({});
importScripts("board.js", "table.js", "ai.js");

let book;
fetch("../book-6ply").then(x => x.json()).then(x => book = x);

const handle = ({data}) => {
  if (data === "reset") {
    table.reset();
    return;
  }
  const {moves, time} = data;
  if (moves.length  > 6) {
    const board = new Board(moves.split("").map(x => parseInt(x)));
    const start = new Date();
    const move = getBestMove(board, time);
    const end = new Date();
    setTimeout(() => {
      postMessage({
        move,
        method: "minimax"
      });
    }, end - start < 500 ? 500 : 0);

  }
  else {
    const entry = book[moves];
    const move = parseInt(entry[Math.floor(Math.random() * entry.length)]);
    setTimeout(() => {
      postMessage({
        move,
        method: "opening book"
      });
    }, 700);
  }
}

self.addEventListener("message", handle);
