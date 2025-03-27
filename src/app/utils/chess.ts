export const WHITE = 'w';
export const BLACK = 'b';

export const PAWN = 'p';
export const KNIGHT = 'n';
export const BISHOP = 'b';
export const ROOK = 'r';
export const QUEEN = 'q';
export const KING = 'k';

export type Color = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';

export type Square = string;
export type BoardState = (PieceSymbol | ' ')[][];

const EMPTY = ' ';

const FLAGS = {
  NORMAL: 'n',
  CAPTURE: 'c',
  BIG_PAWN: 'b',
  EP_CAPTURE: 'e',
  PROMOTION: 'p',
  KSIDE_CASTLE: 'k',
  QSIDE_CASTLE: 'q',
};

// Stałe dla pól roszady
const E1 = 'e1';
const G1 = 'g1';
const C1 = 'c1';
const E8 = 'e8';
const G8 = 'g8';
const C8 = 'c8';

function isValidSquare(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function algebraicToCoords(square: Square): [number, number] | null {
  if (square.length !== 2) {
    return null;
  }
  const file = 'abcdefgh'.indexOf(square[0]);
  const rank = '12345678'.indexOf(square[1]);
  if (file === -1 || rank === -1) {
    return null;
  }
  return [7 - rank, file];
}

function coordsToAlgebraic(row: number, col: number): Square | null {
  if (!isValidSquare(row, col)) {
    return null;
  }
  return 'abcdefgh'[col] + '12345678'[7 - row];
}

function isDigit(c: string): boolean {
  return '0123456789'.indexOf(c) !== -1;
}

export function validateFen(fen: string): { ok: boolean; error?: string } {
  const tokens = fen.split(/\s+/);
  if (tokens.length !== 6) {
    return { ok: false, error: 'Invalid FEN: must contain six space-delimited fields' };
  }
  const moveNumber = parseInt(tokens[5], 10);
  if (isNaN(moveNumber) || moveNumber <= 0) {
    return { ok: false, error: 'Invalid FEN: move number must be a positive integer' };
  }
  const halfMoves = parseInt(tokens[4], 10);
  if (isNaN(halfMoves) || halfMoves < 0) {
    return { ok: false, error: 'Invalid FEN: half move counter number must be a non-negative integer' };
  }
  if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
    return { ok: false, error: 'Invalid FEN: en-passant square is invalid' };
  }
  if (/[^kKqQ-]/.test(tokens[2])) {
    return { ok: false, error: 'Invalid FEN: castling availability is invalid' };
  }
  if (!/^(w|b)$/.test(tokens[1])) {
    return { ok: false, error: 'Invalid FEN: side-to-move is invalid' };
  }
  const rows = tokens[0].split('/');
  if (rows.length !== 8) {
    return { ok: false, error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows" };
  }
  for (let i = 0; i < rows.length; i++) {
    let sumFields = 0;
    let previousWasNumber = false;
    for (let k = 0; k < rows[i].length; k++) {
      if (isDigit(rows[i][k])) {
        if (previousWasNumber) {
          return { ok: false, error: 'Invalid FEN: piece data is invalid (consecutive number)' };
        }
        sumFields += parseInt(rows[i][k], 10);
        previousWasNumber = true;
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return { ok: false, error: 'Invalid FEN: piece data is invalid (invalid piece)' };
        }
        sumFields += 1;
        previousWasNumber = false;
      }
    }
    if (sumFields !== 8) {
      return { ok: false, error: 'Invalid FEN: piece data is invalid (too many squares in rank)' };
    }
  }
  if ((tokens[3][1] === '3' && tokens[1] === 'w') || (tokens[3][1] === '6' && tokens[1] === 'b')) {
    return { ok: false, error: 'Invalid FEN: illegal en-passant square' };
  }
  const kings = [
    { color: 'white', regex: /K/g },
    { color: 'black', regex: /k/g },
  ];
  for (const { color, regex } of kings) {
    if (!regex.test(tokens[0])) {
      return { ok: false, error: `Invalid FEN: missing ${color} king` };
    }
    if ((tokens[0].match(regex) || []).length > 1) {
      return { ok: false, error: `Invalid FEN: too many ${color} kings` };
    }
  }
  if (Array.from(rows[0] + rows[7]).some((char) => char.toUpperCase() === 'P')) {
    return { ok: false, error: 'Invalid FEN: some pawns are on the edge rows' };
  }
  return { ok: true };
}

export class Move {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  flags: string;
  san: string;
  lan: string;
  fenBefore: string;
  fenAfter: string;

  constructor(color: Color, piece: PieceSymbol, from: Square, to: Square, board: ChessGame) {
    this.color = color;
    this.piece = piece;
    this.from = from;
    this.to = to;
    this.flags = ''; // Tymczasowo, do późniejszego określenia
    this.san = ''; // Będzie generowane później
    this.lan = from + to;
    this.fenBefore = board.toFEN();
    this.fenAfter = ''; // Będzie ustawiane po wykonaniu ruchu

    const fromCoords = algebraicToCoords(from)!;
    const toCoords = algebraicToCoords(to)!;
    const targetPiece = board.getPiece(to);
    if (targetPiece !== null && targetPiece !== EMPTY && board.isOpponentPiece(targetPiece, color)) {
      this.flags += FLAGS.CAPTURE;
      this.captured = targetPiece.toLowerCase() as PieceSymbol;
    }
    if (piece.toLowerCase() === PAWN && Math.abs(fromCoords[0] - toCoords[0]) === 2) {
      this.flags += FLAGS.BIG_PAWN;
    }
    if (piece.toLowerCase() === PAWN && to === board.enPassantTarget) {
      const capturedPawnCoords = [toCoords[0] + (color === WHITE ? 1 : -1), toCoords[1]];
      const capturedPawnSquare = coordsToAlgebraic(capturedPawnCoords[0], capturedPawnCoords[1]);
      if (capturedPawnSquare && board.getPiece(capturedPawnSquare)?.toLowerCase() === PAWN) {
        this.flags += FLAGS.EP_CAPTURE;
        this.captured = PAWN;
      }
    }
    if (piece.toLowerCase() === KING) {
      if (from === E1 && to === G1 || from === E8 && to === G8) this.flags += FLAGS.KSIDE_CASTLE;
      if (from === E1 && to === C1 || from === E8 && to === C8) this.flags += FLAGS.QSIDE_CASTLE;
    }
    // Promocja będzie ustawiana w makeMove
  }
}

export class ChessGame {
  board: BoardState;
  turn: Color;
  enPassantTarget: Square | null;
  castlingRights: {
    [WHITE]: { kingside: boolean; queenside: boolean };
    [BLACK]: { kingside: boolean; queenside: boolean };
  };
  halfmoveClock: number;
  fullmoveNumber: number;
  history: Move[];
  whiteKingPosition: [number, number] | null;
  blackKingPosition: [number, number] | null;
  boardHistory: string[]; // Do śledzenia powtórzeń pozycji

  constructor(fen?: string) {
    this.board = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    this.turn = WHITE;
    this.enPassantTarget = null;
    this.castlingRights = {
      [WHITE]: { kingside: true, queenside: true },
      [BLACK]: { kingside: true, queenside: true }
    };
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.history = [];
    this.whiteKingPosition = [7, 4];
    this.blackKingPosition = [0, 4];
    this.boardHistory = [];
    this.boardHistory.push(this.toFEN().split(' ').slice(0, 4).join(' ')); // Początkowa pozycja bez zegarów
    if (fen) {
      this.loadFEN(fen);
    }
  }

  getPiece(square: Square): string | null {
    const coords = algebraicToCoords(square);
    if (coords) {
      return this.board[coords[0]][coords[1]];
    }
    return null;
  }

  isOwnPiece(piece: string, color: Color): boolean {
    return (piece.toUpperCase() === piece && color === WHITE) || (piece.toLowerCase() === piece && color === BLACK);
  }

  isOpponentPiece(piece: string, color: Color): boolean {
    return piece !== EMPTY && ((piece.toUpperCase() === piece && color === BLACK) || (piece.toLowerCase() === piece && color === WHITE));
  }

  isEmpty(square: Square): boolean {
    return this.getPiece(square) === EMPTY;
  }

  getKingPosition(color: Color): [number, number] | null {
    return color === WHITE ? this.whiteKingPosition : this.blackKingPosition;
  }

  isSquareAttacked(square: Square, attackingColor: Color): boolean {
    const coords = algebraicToCoords(square);
    if (!coords) return false;
    const [row, col] = coords;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (this.isOwnPiece(piece, attackingColor)) {
          const possibleMoves = this.getPossibleMovesInternal(r, c, true); // Internal bez sprawdzania szacha
          if (possibleMoves.some(move => move[0] === row && move[1] === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isKingInCheck(color: Color): boolean {
    const kingPos = this.getKingPosition(color);
    if (!kingPos) return false;
    const opponentColor = color === WHITE ? BLACK : WHITE;
    return this.isSquareAttacked(coordsToAlgebraic(kingPos[0], kingPos[1])!, opponentColor);
  }

  getPossibleMoves(startSquare: Square, checkLegal = false): Square[] {
    const moves: Square[] = [];
    const startCoords = algebraicToCoords(startSquare);
    if (!startCoords) {
      return moves;
    }
    const [row, col] = startCoords;
    const piece = this.board[row][col];
    const color = piece.toUpperCase() === piece ? WHITE : BLACK;

    console.log(`getPossibleMoves wywołane dla pola ${startSquare}, checkLegal: ${checkLegal}, figura: ${piece}, kolor: ${color}, tura: ${this.turn}`); // Dodany log

    const internalMoves = this.getPossibleMovesInternal(row, col);

    for (const [endRow, endCol] of internalMoves) {
      const endSquare = coordsToAlgebraic(endRow, endCol)!;
      if (!checkLegal) {
        moves.push(endSquare);
      } else {
        // Symuluj ruch i sprawdź, czy król nie jest w szachu
        const tempBoard = this.board.map(row => [...row]);
        const capturedPiece = tempBoard[endRow][endCol];
        tempBoard[endRow][endCol] = piece;
        tempBoard[row][col] = EMPTY;
        const isLegal = !this.isKingInCheckAfterMove(color, [row, col], [endRow, endCol], tempBoard);
        if (isLegal) {
          moves.push(endSquare);
        }
      }
    }
    return moves;
  }

  isKingInCheckAfterMove(color: Color, startCoords: [number, number], endCoords: [number, number], boardState: BoardState): boolean {
    const [startRow, startCol] = startCoords;
    const [endRow, endCol] = endCoords;
    const piece = boardState[endRow][endCol];
    const opponentColor = color === WHITE ? BLACK : WHITE;

    console.log(`Sprawdzam, czy król koloru ${color} jest w szachu po ruchu ${coordsToAlgebraic(startRow, startCol)} na ${coordsToAlgebraic(endRow, endCol)}`);

    let kingRow: number | null = null;
    let kingCol: number | null = null;

    if (piece.toLowerCase() === KING) {
      kingRow = endRow;
      kingCol = endCol;
    } else {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (boardState[r][c] === (color === WHITE ? KING.toUpperCase() : KING.toLowerCase())) {
            kingRow = r;
            kingCol = c;
            break;
          }
        }
        if (kingRow !== null) break;
      }
    }

    if (kingRow === null || kingCol === null) {
      console.error('Nie znaleziono króla na planszy!');
      return false;
    }

    console.log(`Pozycja króla koloru ${color}: (${kingRow}, ${kingCol}) - ${coordsToAlgebraic(kingRow, kingCol)}`);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const attacker = boardState[r][c];
        if (this.isOwnPiece(attacker, opponentColor)) {
          const possibleAttacks = this.getPossibleMovesInternal(r, c, true, boardState);
          //console.log(`Potencjalny atakujący ${attacker} koloru ${opponentColor} na polu (${r}, ${c}) - ${coordsToAlgebraic(r, c)} ma możliwe ataki:`, possibleAttacks.map(coord => coordsToAlgebraic(coord[0], coord[1])));
          if (possibleAttacks.some(move => move[0] === kingRow && move[1] === kingCol)) {
            //console.log(`Król koloru ${color} na polu (${kingRow}, ${kingCol}) - ${coordsToAlgebraic(kingRow, kingCol)} jest szachowany przez ${attacker} na polu (${r}, ${c}) - ${coordsToAlgebraic(r, c)}`);
            return true;
          }
        }
      }
    }

    //console.log(`Ruch konia nie powoduje szacha króla koloru ${color}.`);
    return false;
  }

  getPossibleMovesInternal(row: number, col: number, forAttackCheck = false, boardStateOverride?: BoardState): [number, number][] {
    const moves: [number, number][] = [];
    const piece = (boardStateOverride || this.board)[row][col];
    const color = piece.toUpperCase() === piece ? WHITE : BLACK;
    const board = boardStateOverride || this.board;

    if (piece.toLowerCase() === PAWN) {
      const direction = color === WHITE ? -1 : 1;
      const startRow = color === WHITE ? 6 : 1;

      let newRow = row + direction;
      if (isValidSquare(newRow, col) && board[newRow][col] === EMPTY && !forAttackCheck) {
        moves.push([newRow, col]);
        if (row === startRow) {
          newRow = row + 2 * direction;
          if (isValidSquare(newRow, col) && board[newRow][col] === EMPTY) {
            moves.push([newRow, col]);
          }
        }
      }
      for (const dc of [-1, 1]) {
        const newCol = col + dc;
        newRow = row + direction;
        if (isValidSquare(newRow, newCol) && (this.isOpponentPiece(board[newRow][newCol], color) || this.enPassantTarget === coordsToAlgebraic(newRow, newCol))) {
          moves.push([newRow, newCol]);
        }
      }
    } else if (piece.toLowerCase() === KNIGHT) {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol) && !this.isOwnPiece(board[newRow][newCol], color)) {
          moves.push([newRow, newCol]);
        }
      }
    } else if (piece.toLowerCase() === BISHOP) {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + i * dr;
          const newCol = col + i * dc;
          if (!isValidSquare(newRow, newCol)) break;
          const targetPiece = board[newRow][newCol];
          if (targetPiece === EMPTY) {
            moves.push([newRow, newCol]);
          } else if (this.isOpponentPiece(targetPiece, color)) {
            moves.push([newRow, newCol]);
            break;
          } else {
            break;
          }
        }
      }
    } else if (piece.toLowerCase() === ROOK) {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + i * dr;
          const newCol = col + i * dc;
          if (!isValidSquare(newRow, newCol)) break;
          const targetPiece = board[newRow][newCol];
          if (targetPiece === EMPTY) {
            moves.push([newRow, newCol]);
          } else if (this.isOpponentPiece(targetPiece, color)) {
            moves.push([newRow, newCol]);
            break;
          } else {
            break;
          }
        }
      }
    } else if (piece.toLowerCase() === QUEEN) {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + i * dr;
          const newCol = col + i * dc;
          if (!isValidSquare(newRow, newCol)) break;
          const targetPiece = board[newRow][newCol];
          if (targetPiece === EMPTY) {
            moves.push([newRow, newCol]);
          } else if (this.isOpponentPiece(targetPiece, color)) {
            moves.push([newRow, newCol]);
            break;
          } else {
            break;
          }
        }
      }
    } else if (piece.toLowerCase() === KING) {
      const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      for (const [dr, dc] of kingMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol) && !this.isOwnPiece(board[newRow][newCol], color)) {
          moves.push([newRow, newCol]);
        }
      }
      if (!forAttackCheck) {
        if (color === WHITE) {
          if (this.castlingRights[WHITE].kingside && board[7][5] === EMPTY && board[7][6] === EMPTY && board[7][7] === 'R' && !this.isSquareAttacked(E1, BLACK) && !this.isSquareAttacked('f1', BLACK) && !this.isSquareAttacked(G1, BLACK)) {
            moves.push([7, 6]);
          }
          if (this.castlingRights[WHITE].queenside && board[7][1] === EMPTY && board[7][2] === EMPTY && board[7][3] === EMPTY && board[7][0] === 'R' && !this.isSquareAttacked(E1, BLACK) && !this.isSquareAttacked('d1', BLACK) && !this.isSquareAttacked('c1', BLACK)) {
            moves.push([7, 2]);
          }
        } else {
          if (this.castlingRights[BLACK].kingside && board[0][5] === EMPTY && board[0][6] === EMPTY && board[0][7] === 'r' && !this.isSquareAttacked(E8, WHITE) && !this.isSquareAttacked('f8', WHITE) && !this.isSquareAttacked(G8, WHITE)) {
            moves.push([0, 6]);
          }
          if (this.castlingRights[BLACK].queenside && board[0][1] === EMPTY && board[0][2] === EMPTY && board[0][3] === EMPTY && board[0][0] === 'r' && !this.isSquareAttacked(E8, WHITE) && !this.isSquareAttacked('d8', WHITE) && !this.isSquareAttacked('c8', WHITE)) {
            moves.push([0, 2]);
          }
        }
      }
    }
    return moves;
  }

  makeMove(startSquare: Square, endSquare: Square, promotionPiece?: PieceSymbol): Move | null {
    const startCoords = algebraicToCoords(startSquare);
    const endCoords = algebraicToCoords(endSquare);

    if (!startCoords || !endCoords) {
      return null;
    }

    const [startRow, startCol] = startCoords;
    const [endRow, endCol] = endCoords;

    const piece = this.board[startRow][startCol];
    const color = piece.toUpperCase() === piece ? WHITE : BLACK;
    const opponentColor = color === WHITE ? BLACK : WHITE;

    const legalMoves = this.getPossibleMoves(startSquare, true);
    if (!legalMoves.includes(endSquare)) {
      return null;
    }

    const move = new Move(color, piece.toLowerCase() as PieceSymbol, startSquare, endSquare, this);
    const capturedPiece = this.board[endRow][endCol];

    // Wykonaj ruch
    this.board[endRow][endCol] = piece as PieceSymbol | ' ';
    this.board[startRow][startCol] = EMPTY;

    // Obsługa promocji piona
    if (piece.toLowerCase() === PAWN && endRow === (color === WHITE ? 0 : 7)) {
      this.board[endRow][endCol] = (
        (promotionPiece || QUEEN).toUpperCase() === QUEEN.toUpperCase() ?
          (color === WHITE ? QUEEN.toUpperCase() : QUEEN.toLowerCase()) :
          (promotionPiece || QUEEN).toUpperCase() === ROOK.toUpperCase() ?
            (color === WHITE ? ROOK.toUpperCase() : ROOK.toLowerCase()) :
            (promotionPiece || QUEEN).toUpperCase() === BISHOP.toUpperCase() ?
              (color === WHITE ? BISHOP.toUpperCase() : BISHOP.toLowerCase()) :
              (color === WHITE ? KNIGHT.toUpperCase() : KNIGHT.toLowerCase())
      ) as PieceSymbol; // Dodano jawne rzutowanie na PieceSymbol
      move.promotion = (this.board[endRow][endCol] as string).toLowerCase() as PieceSymbol;
      move.flags += FLAGS.PROMOTION;
      move.lan += move.promotion;
    }

    // Obsługa en passant
    if (piece.toLowerCase() === PAWN && endSquare === this.enPassantTarget) {
      const captureRow = endRow + (color === WHITE ? 1 : -1);
      this.board[captureRow][endCol] = EMPTY;
    }

    // Aktualizacja enPassantTarget
    if (piece.toLowerCase() === PAWN && Math.abs(startRow - endRow) === 2) {
      this.enPassantTarget = coordsToAlgebraic(startRow + (endRow - startRow) / 2, startCol);
    } else {
      this.enPassantTarget = null;
    }

    // Obsługa roszady
    if (piece.toLowerCase() === KING) {
      if (startSquare === E1 && endSquare === G1) {
        this.board[7][5] = 'R';
        this.board[7][7] = EMPTY;
      } else if (startSquare === E1 && endSquare === C1) {
        this.board[7][3] = 'R';
        this.board[7][0] = EMPTY;
      } else if (startSquare === E8 && endSquare === G8) {
        this.board[0][5] = 'r';
        this.board[0][7] = EMPTY;
      } else if (startSquare === E8 && endSquare === C8) {
        this.board[0][3] = 'r';
        this.board[0][0] = EMPTY;
      }
      this.castlingRights[color].kingside = false;
      this.castlingRights[color].queenside = false;
      this.whiteKingPosition = color === WHITE ? endCoords : this.whiteKingPosition;
      this.blackKingPosition = color === BLACK ? endCoords : this.blackKingPosition;
    } else if (piece.toLowerCase() === ROOK) {
      if (startSquare === 'a1') this.castlingRights[WHITE].queenside = false;
      else if (startSquare === 'h1') this.castlingRights[WHITE].kingside = false;
      else if (startSquare === 'a8') this.castlingRights[BLACK].queenside = false;
      else if (startSquare === 'h8') this.castlingRights[BLACK].kingside = false;
    }

    move.fenAfter = this.toFEN();
    this.history.push(move);

    // Zmiana tury
    this.turn = opponentColor;

    // Aktualizacja zegarów
    if (capturedPiece !== EMPTY || piece.toLowerCase() === PAWN) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    if (color === BLACK) {
      this.fullmoveNumber++;
    }

    // Aktualizacja pozycji króla
    if (piece.toLowerCase() === KING) {
      if (color === WHITE) {
        this.whiteKingPosition = endCoords;
      } else {
        this.blackKingPosition = endCoords;
      }
    }

    this.boardHistory.push(this.toFEN().split(' ').slice(0, 4).join(' '));

    move.san = this.generateSAN(move);

    return move;
  }

  generateSAN(move: Move): string {
    let san = '';
    const piece = move.piece.toUpperCase();
    const fromCoords = algebraicToCoords(move.from)!;
    const toCoords = algebraicToCoords(move.to)!;

    if (move.flags.includes(FLAGS.KSIDE_CASTLE)) return 'O-O';
    if (move.flags.includes(FLAGS.QSIDE_CASTLE)) return 'O-O-O';

    const potentialAmbiguities: Move[] = this.history.filter(hMove =>
      hMove.color === move.color &&
      hMove.piece === move.piece &&
      hMove.to === move.to &&
      hMove.from !== move.from
    );

    let disambiguationFile = false;
    let disambiguationRank = false;

    if (piece === PAWN.toUpperCase() && move.flags.includes(FLAGS.CAPTURE)) {
      const fromFile = move.from[0];
      if (potentialAmbiguities.some(ambiguousMove => ambiguousMove.from[0] === fromFile)) {
        disambiguationFile = true;
      }
      san += fromFile;
      san += 'x';
    } else {
      if (potentialAmbiguities.length > 0) {
        const fromFile = move.from[0];
        const fromRank = move.from[1];

        if (potentialAmbiguities.some(ambiguousMove => ambiguousMove.from[0] === fromFile)) {
          disambiguationRank = true;
        }
        if (potentialAmbiguities.some(ambiguousMove => ambiguousMove.from[1] === fromRank)) {
          disambiguationFile = true;
        }

        if (disambiguationFile && disambiguationRank) {
          san += move.from;
        } else if (disambiguationFile) {
          san += fromFile;
        } else if (disambiguationRank) {
          san += fromRank;
        }
      }

      if (piece !== PAWN.toUpperCase()) {
        san += piece;
      }

      if (move.flags.includes(FLAGS.CAPTURE)) {
        san += 'x';
      }
    }

    san += move.to;

    if (move.promotion) {
      san += '=' + move.promotion.toUpperCase();
    }

    const gameStateAfterMove = new ChessGame(move.fenAfter);
    if (gameStateAfterMove.isKingInCheck(gameStateAfterMove.turn === WHITE ? BLACK : WHITE)) {
      if (gameStateAfterMove.isCheckmate()) {
        san += '#';
      } else {
        san += '+';
      }
    }

    return san;
  }

  isCheck(): boolean {
    return this.isKingInCheck(this.turn);
  }

  isCheckmate(): boolean {
    if (!this.isCheck()) {
      return false;
    }
    const currentColor = this.turn;
    const possibleMoves = this.getAllPossibleLegalMoves(currentColor);
    return possibleMoves.length === 0;
  }

  isStalemate(): boolean {
    if (this.isCheck()) {
      return false;
    }
    const currentColor = this.turn;
    const possibleMoves = this.getAllPossibleLegalMoves(currentColor);
    return possibleMoves.length === 0;
  }

  isFiftyMoveRule(): boolean {
    return this.halfmoveClock >= 100; // 50 ruchów * 2 graczy
  }

  isThreefoldRepetition(): boolean {
    const currentPosition = this.toFEN().split(' ').slice(0, 4).join(' ');
    return this.boardHistory.filter(pos => pos === currentPosition).length >= 3;
  }

  isInsufficientMaterial(): boolean {
    const pieces = this.board.flat().filter(p => p !== EMPTY);
    const whitePieces = pieces.filter(p => p === p.toUpperCase());
    const blackPieces = pieces.filter(p => p === p.toLowerCase());

    const count = (arr: string[], piece: string) => arr.filter(p => p.toLowerCase() === piece).length;

    const whitePawns = count(whitePieces, PAWN);
    const blackPawns = count(blackPieces, PAWN);
    const whiteRooks = count(whitePieces, ROOK);
    const blackRooks = count(blackPieces, ROOK);
    const whiteQueens = count(whitePieces, QUEEN);
    const blackQueens = count(blackPieces, QUEEN);
    const whiteKnights = count(whitePieces, KNIGHT);
    const blackKnights = count(blackPieces, KNIGHT);
    const whiteBishops = count(whitePieces, BISHOP);
    const blackBishops = count(blackPieces, BISHOP);
    const totalWhitePieces = whitePieces.length;
    const totalBlackPieces = blackPieces.length;

    // Król vs Król
    if (totalWhitePieces === 1 && totalBlackPieces === 1) return true;

    // Król i Goniec vs Król
    if (totalWhitePieces === 2 && whiteBishops === 1 && totalBlackPieces === 1) return true;
    if (totalBlackPieces === 2 && blackBishops === 1 && totalWhitePieces === 1) return true;

    // Król i Skoczek vs Król
    if (totalWhitePieces === 2 && whiteKnights === 1 && totalBlackPieces === 1) return true;
    if (totalBlackPieces === 2 && blackKnights === 1 && totalWhitePieces === 1) return true;

    // Król i dwa Skoczki vs Król (może być mat)
    // Król i więcej niż jeden Goniec na tym samym kolorze pól vs Król (może być mat)
    const whiteBishopsOnSameColor = whiteBishops >= 2 && this.checkBishopsOnSameColor(WHITE);
    const blackBishopsOnSameColor = blackBishops >= 2 && this.checkBishopsOnSameColor(BLACK);
    if (totalWhitePieces === whiteBishops + 1 && whiteBishops >= 2 && whiteBishopsOnSameColor && totalBlackPieces === 1) return true;
    if (totalBlackPieces === blackBishops + 1 && blackBishops >= 2 && blackBishopsOnSameColor && totalWhitePieces === 1) return true;


    return false;
  }

  private checkBishopsOnSameColor(color: Color): boolean {
    const bishops = this.board.flat().reduce((acc, piece, index) => {
      const isBishop = color === WHITE ? piece === 'B' : piece === 'b';
      if (isBishop) {
        const row = Math.floor(index / 8);
        const col = index % 8;
        acc.push((row + col) % 2); // 0 for white squares, 1 for black squares
      }
      return acc;
    }, [] as number[]);

    if (bishops.length < 2) return false;
    return bishops.every(val => val === bishops[0]);
  }

  getAllPossibleLegalMoves(color: Color): Square[] {
    const legalMoves: Square[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (this.isOwnPiece(piece, color)) {
          const startSquare = coordsToAlgebraic(row, col)!;
          const moves = this.getPossibleMoves(startSquare, true);
          legalMoves.push(...moves);
        }
      }
    }
    return legalMoves;
  }

  toFEN(): string {
    let fen = '';
    for (let i = 0; i < 8; i++) {
      let emptyCount = 0;
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece === EMPTY) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += piece;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (i < 7) {
        fen += '/';
      }
    }

    let castling = '';
    if (this.castlingRights[WHITE].kingside) castling += 'K';
    if (this.castlingRights[WHITE].queenside) castling += 'Q';
    if (this.castlingRights[BLACK].kingside) castling += 'k';
    if (this.castlingRights[BLACK].queenside) castling += 'q';
    if (castling === '') castling = '-';

    const enPassant = this.enPassantTarget ? this.enPassantTarget : '-';

    return `${fen} ${this.turn} ${castling} ${enPassant} ${this.halfmoveClock} ${this.fullmoveNumber}`;
  }

  loadFEN(fen: string): void {
    const parts = fen.split(' ');
    if (parts.length !== 6) {
      console.error('Invalid FEN string');
      return;
    }

    const piecePlacement = parts[0].split('/');
    if (piecePlacement.length !== 8) {
      console.error('Invalid FEN: Incorrect number of ranks');
      return;
    }

    this.board = [];
    for (const rank of piecePlacement) {
      const row: (PieceSymbol | ' ')[] = [];
      for (const char of rank) {
        if (isDigit(char)) {
          row.push(...Array(parseInt(char)).fill(EMPTY));
        } else {
          row.push(char as PieceSymbol);
        }
      }
      this.board.push(row);
    }

    this.turn = parts[1] as Color;

    this.castlingRights = {
      [WHITE]: { kingside: parts[2].includes('K'), queenside: parts[2].includes('Q') },
      [BLACK]: { kingside: parts[2].includes('k'), queenside: parts[2].includes('q') },
    };

    this.enPassantTarget = parts[3] === '-' ? null : parts[3];
    this.halfmoveClock = parseInt(parts[4]);
    this.fullmoveNumber = parseInt(parts[5]);
    this.history = []; // Reset history on load
    this.whiteKingPosition = this.getKingPosition(WHITE);
    this.blackKingPosition = this.getKingPosition(BLACK);
    this.boardHistory = [this.toFEN().split(' ').slice(0, 4).join(' ')]; // Reset history on load
  }

  toString(): string {
    let boardStr = "";
    for (const row of this.board) {
      boardStr += row.join("|") + "\n";
    }
    return boardStr;
  }
}
