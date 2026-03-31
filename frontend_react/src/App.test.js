import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Tic Tac Toe title and New game button", () => {
  render(<App />);
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /new game/i })).toBeInTheDocument();
});
