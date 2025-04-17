import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [player1Symbol, setPlayer1Symbol] = useState(null);
  const [player2Symbol, setPlayer2Symbol] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (newBoard) => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return newBoard[a];
      }
    }
    return newBoard.includes("") ? null : "Draw";
  };

  const handleClick = (index) => {
    if (!gameStarted || board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    const gameWinner = checkWinner(newBoard);
    setWinner(gameWinner);
    if (!gameWinner) setCurrentPlayer(currentPlayer === player1Symbol ? player2Symbol : player1Symbol);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setGameStarted(false);
    setPlayer1Symbol(null);
    setPlayer2Symbol(null);
    setCurrentPlayer(null);
  };

  const startGame = (symbol) => {
    setPlayer1Symbol(symbol);
    setPlayer2Symbol(symbol === "X" ? "O" : "X");
    setCurrentPlayer("X"); 
    setGameStarted(true);
  };

  return (
    <div className="container text-center mt-4">
      <h1 className="text-primary">Tic Tac Toe</h1>

      {!gameStarted ? (
        <div>
          <h3 className="text-secondary">Choose Your Symbol</h3>
          <button className="btn btn-outline-primary m-2" onClick={() => startGame("X")}>X</button>
          <button className="btn btn-outline-danger m-2" onClick={() => startGame("O")}>O</button>
        </div>
      ) : (
        <>
          <h3 className="text-info">
            {winner
              ? winner === "Draw" 
                ? "It's a Draw!" 
                : `${winner === player1Symbol ? "Player 1" : "Player 2"} Wins!`
              : `Turn: ${currentPlayer === player1Symbol ? "Player 1" : "Player 2"} (${currentPlayer})`}
          </h3>
          <div className="d-flex flex-wrap justify-content-center" style={{ width: "300px", margin: "20px auto" }}>
            {board.map((cell, index) => (
              <div
                key={index}
                className="border d-flex align-items-center justify-content-center bg-light"
                style={{ width: "100px", height: "100px", fontSize: "2rem", cursor: "pointer" }}
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          <button className="btn btn-dark mt-3" onClick={resetGame}>Reset Game</button>
        </>
      )}
    </div>
  );
};

export default TicTacToe;
