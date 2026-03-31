import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

/**
 * Test helpers
 */
function getStatus() {
  // App uses: <div className="statusCard" role="status" aria-live="polite">
  return screen.getByRole("status");
}

function expectTurnToBe(player) {
  expect(within(getStatus()).getByText(`Turn: ${player}`)).toBeInTheDocument();
}

function expectWinnerToBe(player) {
  expect(within(getStatus()).getByText(`Winner: ${player}`)).toBeInTheDocument();
}

function expectDraw() {
  expect(within(getStatus()).getByText("It's a draw.")).toBeInTheDocument();
}

function getBoardCells() {
  // Each square is a button with role="gridcell" and aria-label "Square N" (and value if filled)
  return screen.getAllByRole("gridcell");
}

async function clickCell(user, index) {
  const cells = getBoardCells();
  await user.click(cells[index]);
}

function expectCellToHaveValue(index, value) {
  // When filled, aria-label becomes `Square ${idx + 1}: X|O`
  expect(
    screen.getByRole("gridcell", { name: new RegExp(`^Square ${index + 1}: ${value}$`) })
  ).toBeInTheDocument();
}

function expectCellToBeEmpty(index) {
  expect(
    screen.getByRole("gridcell", { name: new RegExp(`^Square ${index + 1}$`) })
  ).toBeInTheDocument();
}

function expectAllCellsEmpty() {
  for (let i = 0; i < 9; i += 1) {
    expectCellToBeEmpty(i);
  }
}

function getNewGameButton() {
  return screen.getByRole("button", { name: /new game/i });
}

describe("Tic Tac Toe gameplay", () => {
  test("renders header and initial state (X starts)", () => {
    render(<App />);

    expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
    expect(getNewGameButton()).toBeInTheDocument();

    expectTurnToBe("X");
    expectAllCellsEmpty();
  });

  test("alternates turns (X then O), prevents playing in an occupied square", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X plays
    expectTurnToBe("X");
    await clickCell(user, 0);
    expectCellToHaveValue(0, "X");

    // Now O's turn
    expectTurnToBe("O");

    // Clicking same occupied square should do nothing (still O's turn, still X in square 1)
    await clickCell(user, 0);
    expectTurnToBe("O");
    expectCellToHaveValue(0, "X");

    // O plays a different square
    await clickCell(user, 1);
    expectCellToHaveValue(1, "O");
    expectTurnToBe("X");
  });

  test("detects an X win (top row), disables further play, and highlights winning squares", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // X wins on top row [0,1,2]
    // X: 0,1,2
    // O: 3,4 (any non-blocking)
    await clickCell(user, 0); // X
    await clickCell(user, 3); // O
    await clickCell(user, 1); // X
    await clickCell(user, 4); // O
    await clickCell(user, 2); // X -> win

    expectWinnerToBe("X");

    // Further play should be disabled; pick an empty square (e.g. index 8)
    // It should remain empty and disabled.
    const cell9 = screen.getByRole("gridcell", { name: /^Square 9$/ });
    expect(cell9).toBeDisabled();
    await user.click(cell9);
    expect(screen.getByRole("gridcell", { name: /^Square 9$/ })).toBeInTheDocument();

    // Winning squares should have the .squareWin class (3 squares)
    const winningSquares = container.querySelectorAll(".squareWin");
    expect(winningSquares.length).toBe(3);

    // And they should correspond to the top row.
    // (Buttons have aria-label Square N...; verify 1,2,3 are among the winners.)
    const winnerLabels = Array.from(winningSquares).map((el) => el.getAttribute("aria-label"));
    expect(winnerLabels).toEqual(
      expect.arrayContaining(["Square 1: X", "Square 2: X", "Square 3: X"])
    );
  });

  test("detects a draw when all squares are filled with no winner, disables further play", async () => {
    const user = userEvent.setup();
    render(<App />);

    // A known draw sequence (no 3-in-a-row):
    // X: 0,2,3,7,8
    // O: 1,4,5,6
    const moves = [0, 1, 2, 4, 3, 5, 6, 7, 8];
    for (const idx of moves) {
      await clickCell(user, idx);
    }

    expectDraw();

    // Board should be locked after draw
    const cells = getBoardCells();
    for (const cell of cells) {
      expect(cell).toBeDisabled();
    }
  });

  test("New game resets board and status (clears winner/draw and returns to X turn)", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a quick win for X
    await clickCell(user, 0); // X
    await clickCell(user, 3); // O
    await clickCell(user, 1); // X
    await clickCell(user, 4); // O
    await clickCell(user, 2); // X -> win

    expectWinnerToBe("X");

    await user.click(getNewGameButton());

    // Reset expectations
    expectTurnToBe("X");
    expectAllCellsEmpty();

    // And first move after reset should be X
    await clickCell(user, 8);
    expectCellToHaveValue(8, "X");
    expectTurnToBe("O");
  });
});
