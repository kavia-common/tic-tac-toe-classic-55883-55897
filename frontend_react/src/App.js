import React, { useCallback, useMemo, useState } from "react";
import "./App.css";

const BOARD_SIZE = 3;

/**
 * Returns all winning line index triplets for a 3x3 tic tac toe board.
 * e.g. [0,1,2] is top row, [0,4,8] is main diagonal, etc.
 */
function getWinningLines() {
  const lines = [];

  // Rows
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c += 1) row.push(r * BOARD_SIZE + c);
    lines.push(row);
  }

  // Cols
  for (let c = 0; c < BOARD_SIZE; c += 1) {
    const col = [];
    for (let r = 0; r < BOARD_SIZE; r += 1) col.push(r * BOARD_SIZE + c);
    lines.push(col);
  }

  // Diagonals
  lines.push([0, 4, 8]);
  lines.push([2, 4, 6]);

  return lines;
}

const WINNING_LINES = getWinningLines();

/**
 * Compute winner for a given board.
 * @param {(null|'X'|'O')[]} squares
 * @returns {{winner: null|'X'|'O', line: number[]|null}}
 */
function calculateWinner(squares) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}

// PUBLIC_INTERFACE
function App() {
  /** squares holds 9 values: null | 'X' | 'O' */
  const [squares, setSquares] = useState(() => Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const { winner, line: winningLine } = useMemo(
    () => calculateWinner(squares),
    [squares]
  );

  const isDraw = useMemo(() => {
    if (winner) return false;
    return squares.every((s) => s !== null);
  }, [squares, winner]);

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "It's a draw.";
    return `Turn: ${xIsNext ? "X" : "O"}`;
  }, [winner, isDraw, xIsNext]);

  const canPlay = !winner && !isDraw;

  const handlePlay = useCallback(
    (idx) => {
      if (!canPlay) return;
      if (squares[idx] !== null) return;

      setSquares((prev) => {
        const next = prev.slice();
        next[idx] = xIsNext ? "X" : "O";
        return next;
      });
      setXIsNext((prev) => !prev);
    },
    [canPlay, squares, xIsNext]
  );

  // PUBLIC_INTERFACE
  const newGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }, []);

  return (
    <div className="App">
      <main className="page">
        <header className="header">
          <div className="brand">
            <div className="brandMark" aria-hidden="true" />
            <div>
              <h1 className="title">Tic Tac Toe</h1>
              <p className="subtitle">Classic 3×3. First to three in a row wins.</p>
            </div>
          </div>

          <div className="statusCard" role="status" aria-live="polite">
            <span className={`statusPill ${winner ? "statusPillWin" : isDraw ? "statusPillDraw" : ""}`}>
              {statusText}
            </span>
            <button className="btn" type="button" onClick={newGame}>
              New game
            </button>
          </div>
        </header>

        <section className="boardSection" aria-label="Game board">
          <div className="board" role="grid" aria-label="Tic Tac Toe board">
            {squares.map((value, idx) => {
              const isWinningSquare = winningLine ? winningLine.includes(idx) : false;
              const isDisabled = !canPlay || value !== null;

              return (
                <button
                  key={idx}
                  type="button"
                  className={[
                    "square",
                    value === "X" ? "squareX" : "",
                    value === "O" ? "squareO" : "",
                    isWinningSquare ? "squareWin" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handlePlay(idx)}
                  disabled={isDisabled}
                  role="gridcell"
                  aria-label={`Square ${idx + 1}${value ? `: ${value}` : ""}`}
                >
                  <span className="squareValue" aria-hidden="true">
                    {value ?? ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hint">
            <p className="hintText">
              Tip: Click an empty square to place your mark. The game ends when someone wins or all squares are filled.
            </p>
          </div>
        </section>

        <footer className="footer">
          <span className="footerText">Built with React • Modern light theme</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
