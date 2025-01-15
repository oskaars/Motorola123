// components/ChessBoard.tsx
import React from 'react';
import { ChessPosition } from '../types/types';
import '../styles/globals.css';


interface Props {
    position: ChessPosition;
    onSquareClick: (square: string) => void;
}

const ChessBoard: React.FC<Props> = ({ position, onSquareClick }) => {
  const squares = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = String.fromCharCode(97 + col) + (8 - row);
      const piece = position[square] || null;
      const isLight = (row + col) % 2 === 0;


        const squareStyle = isLight ? "lightSquare" : "darkSquare";

      squares.push(
          <div
              key={square}
              className={squareStyle + " " + "square"}
              onClick={() => onSquareClick(square)}
          >
          {piece ? <div className={"piece"}>{piece}</div> : null}
          </div>
      );
    }
  }

  return <div className={"board"}>{squares}</div>;
};

export default ChessBoard;