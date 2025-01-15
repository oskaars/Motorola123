// utils/chess.ts
import { ChessMove, ChessPosition, ChessPiece } from "../types/types";

const DEFAULT_POSITION: ChessPosition = {
    a8: 'r', b8: 'n', c8: 'b', d8: 'q', e8: 'k', f8: 'b', g8: 'n', h8: 'r',
    a7: 'p', b7: 'p', c7: 'p', d7: 'p', e7: 'p', f7: 'p', g7: 'p', h7: 'p',
    a2: 'P', b2: 'P', c2: 'P', d2: 'P', e2: 'P', f2: 'P', g2: 'P', h2: 'P',
    a1: 'R', b1: 'N', c1: 'B', d1: 'Q', e1: 'K', f1: 'B', g1: 'N', h1: 'R',
};


const isInsideBoard = (row: number, col: number): boolean => row >= 0 && row < 8 && col >= 0 && col < 8;

const algebraicToCoords = (pos: string): [number, number] | null => {
  if (pos.length !== 2) return null;
  const col = pos[0].toLowerCase().charCodeAt(0) - 97;
  const row = 8 - parseInt(pos[1]);
  return isInsideBoard(row, col) ? [row, col] : null;
};

const coordsToAlgebraic = (row: number, col: number): string | null => {
  if(!isInsideBoard(row, col)) return null;
  return String.fromCharCode(97 + col) + (8 - row);
}

const getPieceAt = (position: ChessPosition, pos: string): ChessPiece => {
  return position[pos] || null
}

// Function to check if a move is valid
export const isValidMove = (position: ChessPosition, move: ChessMove, playerColor: 'white' | 'black'): boolean => {
    const [fromRow, fromCol] = algebraicToCoords(move.from) || [0, 0];
    const [toRow, toCol] = algebraicToCoords(move.to) || [0, 0];

    const fromAlgebraic = coordsToAlgebraic(fromRow, fromCol) || "";
    const toAlgebraic = coordsToAlgebraic(toRow, toCol) || "";

    if (!fromAlgebraic || !toAlgebraic || !isInsideBoard(fromRow, fromCol) || !isInsideBoard(toRow, toCol)) {
        return false;
    }

  const piece = getPieceAt(position, fromAlgebraic)

  if (!piece) return false

  const isWhite = piece.toUpperCase() === piece;
  if ((playerColor === 'white' && !isWhite) || (playerColor === 'black' && isWhite)) {
      return false;
  }

  switch(piece.toUpperCase()) {
      case "P":
        return isValidPawnMove(position, fromRow, fromCol, toRow, toCol, playerColor)
      case "R":
        return isValidRookMove(position, fromRow, fromCol, toRow, toCol)
      case "N":
        return isValidKnightMove(position, fromRow, fromCol, toRow, toCol)
      case "B":
        return isValidBishopMove(position, fromRow, fromCol, toRow, toCol)
      case "Q":
        return isValidQueenMove(position, fromRow, fromCol, toRow, toCol)
      case "K":
        return isValidKingMove(position, fromRow, fromCol, toRow, toCol)
        default:
            return false
  }
};


function isValidPawnMove(position: ChessPosition, fromRow: number, fromCol: number, toRow: number, toCol: number, playerColor: 'white' | 'black') : boolean{
    const direction = playerColor === 'white' ? -1 : 1;
    const startRow = playerColor === 'white' ? 6 : 1;

    const dx = Math.abs(toCol - fromCol)
    const dy = toRow - fromRow;

    if(dx > 1){
      return false
    }

    // Move forward one square
    if (dy === direction && dx === 0) {
        return !getPieceAt(position, coordsToAlgebraic(toRow,toCol) || "")
    }

    // Move forward two squares from starting position
    if(fromRow === startRow && dy === 2 * direction && dx === 0){
        const oneStep = coordsToAlgebraic(fromRow + direction, fromCol) || "";
         return !getPieceAt(position, coordsToAlgebraic(toRow,toCol) || "") && !getPieceAt(position, oneStep)
    }

    // Capture diagonally
    if (dy === direction && dx === 1) {
        const target = getPieceAt(position, coordsToAlgebraic(toRow,toCol) || "");
       return !!target && (playerColor === 'white' ? (target !== target.toUpperCase()) : (target === target.toUpperCase()));
    }

    return false
}


function isValidRookMove(position: ChessPosition, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    if (fromRow !== toRow && fromCol !== toCol) return false;

    const rowDir = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1)
    const colDir = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1)

    let curRow = fromRow + rowDir;
    let curCol = fromCol + colDir;

    while(curRow !== toRow || curCol !== toCol) {
        const algebraicPosition = coordsToAlgebraic(curRow, curCol) || "";
        if(getPieceAt(position, algebraicPosition)){
          return false
        }
      curRow+= rowDir
      curCol+= colDir
    }
    const targetPiece = getPieceAt(position, coordsToAlgebraic(toRow, toCol) || "");
    return !targetPiece || isOpponentPiece(position, coordsToAlgebraic(fromRow,fromCol) || "", coordsToAlgebraic(toRow, toCol) || "");
}

function isValidBishopMove(position: ChessPosition, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (rowDiff !== colDiff) return false;

    const rowDir = toRow > fromRow ? 1 : -1
    const colDir = toCol > fromCol ? 1 : -1

    let curRow = fromRow + rowDir
    let curCol = fromCol + colDir

    while (curRow !== toRow) {
        const algebraicPosition = coordsToAlgebraic(curRow, curCol) || "";
        if(getPieceAt(position, algebraicPosition)){
          return false
        }
        curRow += rowDir
        curCol += colDir
    }
    const targetPiece = getPieceAt(position, coordsToAlgebraic(toRow, toCol) || "");
     return !targetPiece || isOpponentPiece(position, coordsToAlgebraic(fromRow,fromCol) || "", coordsToAlgebraic(toRow, toCol) || "");
}

function isValidKnightMove(position: ChessPosition, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
        return false;
    }

    const targetPiece = getPieceAt(position, coordsToAlgebraic(toRow, toCol) || "");
     return !targetPiece || isOpponentPiece(position, coordsToAlgebraic(fromRow,fromCol) || "", coordsToAlgebraic(toRow, toCol) || "");
}

function isValidQueenMove(position: ChessPosition, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    return isValidRookMove(position, fromRow, fromCol, toRow, toCol) || isValidBishopMove(position, fromRow, fromCol, toRow, toCol)
}


function isValidKingMove(position: ChessPosition, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (rowDiff > 1 || colDiff > 1) {
      return false;
    }
     const targetPiece = getPieceAt(position, coordsToAlgebraic(toRow, toCol) || "");
     return !targetPiece || isOpponentPiece(position, coordsToAlgebraic(fromRow,fromCol) || "", coordsToAlgebraic(toRow, toCol) || "");
}

const isOpponentPiece = (position: ChessPosition, from: string, to: string): boolean => {
    const pieceFrom = getPieceAt(position, from);
    const pieceTo = getPieceAt(position, to);
  
    if(!pieceFrom || !pieceTo) return false;
  
    const isWhiteFrom = pieceFrom.toUpperCase() === pieceFrom
    const isWhiteTo = pieceTo.toUpperCase() === pieceTo
  
    return isWhiteFrom !== isWhiteTo
}

export const applyMove = (position: ChessPosition, move: ChessMove): ChessPosition => {
  const newPosition = { ...position };

  const piece = getPieceAt(position, move.from)
  if(piece){
     newPosition[move.to] = piece;
     delete newPosition[move.from];
  }


  return newPosition
}
export const initializeChessBoard = () => {
    return { ...DEFAULT_POSITION }
};