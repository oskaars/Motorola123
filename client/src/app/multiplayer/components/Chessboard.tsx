"use client";
import React, { useRef, useState, useEffect, forwardRef, ForwardedRef} from "react";
import { JSX } from "react/jsx-runtime";
import Tile from "./Tile";
import Referee from "@/app/multiplayer/referee/referee";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export interface Piece {image: string; x: number; y: number; type: PieceType; team: TeamType;}

export enum PieceType {PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING,}

export enum TeamType {OUR, OPPONENTS,}

export enum GameState {ACTIVE, CHECK, CHECKMATE, STALEMATE,}

export interface Position {x: number; y: number;}

export interface CastlingRights {whiteKingSide: boolean; whiteQueenSide: boolean; blackKingSide: boolean; blackQueenSide: boolean;}

const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const pieceImages = {
  p: "/pawns/BlackPawn.svg",
  r: "/pawns/BlackRook.svg",
  n: "/pawns/BlackKnight.svg",
  b: "/pawns/BlackBishop.svg",
  q: "/pawns/BlackQueen.svg",
  k: "/pawns/BlackKing.svg",
  P: "/pawns/WhitePawn.svg",
  R: "/pawns/WhiteRook.svg",
  N: "/pawns/WhiteKnight.svg",
  B: "/pawns/WhiteBishop.svg",
  Q: "/pawns/WhiteQueen.svg",
  K: "/pawns/WhiteKing.svg",
};
interface ChessboardProps {
  onMove(notation: string): unknown;
  onGameStateChange?: (state: GameState, team: TeamType | null) => void;
}
function loadPositionFromFEN(fen: string): Piece[] {
  const pieces: Piece[] = [];
  const fenBoard = fen.split(" ")[0];
  let file = 0;
  let rank = 7;

  for (const symbol of fenBoard) {
    if (symbol === "/") {
      file = 0;
      rank--;
    } else if (!isNaN(parseInt(symbol))) {
      file += parseInt(symbol);
    } else {
      const image = pieceImages[symbol as keyof typeof pieceImages];
      if (image) {
        const team = rank < 2 ? TeamType.OUR : TeamType.OPPONENTS;
        pieces.push({
          image,
          x: file,
          y: rank,
          type: getPieceType(symbol),
          team,
        });
      }
      file++;
    }
  }
  return pieces;
}

function getPieceType(symbol: string): PieceType {
  switch (symbol) {
    case "p":
    case "P":
      return PieceType.PAWN;
    case "r":
    case "R":
      return PieceType.ROOK;
    case "n":
    case "N":
      return PieceType.KNIGHT;
    case "b":
    case "B":
      return PieceType.BISHOP;
    case "q":
    case "Q":
      return PieceType.QUEEN;
    case "k":
    case "K":
      return PieceType.KING;
    default:
      throw new Error(`Unknown piece symbol: ${symbol}`);
  }
}

function isInsideBoard(x: number, y: number): boolean {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}
  const Chessboard = forwardRef((props: ChessboardProps, ref: ForwardedRef<any>) => {
  const [pieces, setPieces] = useState<Piece[]>(loadPositionFromFEN(startFEN));
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [gridX, setGridX] = useState(0);
  const [gridY, setGridY] = useState(0);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
  const [isInCheck, setIsInCheck] = useState<TeamType | null>(null);
  const [isCheckmate, setIsCheckmate] = useState<TeamType | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.ACTIVE);
  const [currentTurn, setCurrentTurn] = useState<TeamType>(TeamType.OUR);
  const chessboardRef = useRef<HTMLDivElement>(null);
  const referee = new Referee();
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true,});
  const [promotionPawn, setPromotionPawn] = useState<Piece | null>(null);
  const [promotionPosition, setPromotionPosition] = useState<Position | null>(null);
	const [isPromoting, setIsPromoting] = useState(false);
      useEffect(() => {
        if (ref) {
          (ref as any).current = {
            executeNotationMove: (notation: string) => {
              return executeMove(notation);
            }
          };
        }
      }, [pieces, currentTurn]);
  useEffect(() => {
    if (ref) {
      (ref as any).current = {
        executeNotationMove: (notation: string) => {
          return executeMove(notation);
        }
      };
    }
  }, [pieces, currentTurn]);
      useEffect(() => {
        if (gameState !== GameState.ACTIVE && gameState !== GameState.CHECK) {
          return;
        }

        if (isInCheck) {
          if (referee.isCheckmate(isInCheck, pieces)) {
            setIsCheckmate(isInCheck);
            setGameState(GameState.CHECKMATE);

            // Notify the server about the checkmate and the winner
            if (props.onGameStateChange) {
              const winner = isInCheck === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR;
              props.onGameStateChange(GameState.CHECKMATE, winner);
            }
          } else {
            setGameState(GameState.CHECK);
            if (props.onGameStateChange) {
              props.onGameStateChange(GameState.CHECK, isInCheck);
            }
          }
        } else {
          if (referee.isStalemate(currentTurn, pieces)) {
            setGameState(GameState.STALEMATE);
            if (props.onGameStateChange) {
              props.onGameStateChange(GameState.STALEMATE, null);
            }
          }
        }
      }, [pieces, isInCheck, currentTurn, referee, gameState, props.onGameStateChange]);
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (activePiece) {
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
        setActivePiece(null);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [activePiece]);

  useEffect(() => {
    if (gameState !== GameState.ACTIVE && gameState !== GameState.CHECK) {
      return;
    }

    if (isInCheck) {
      if (referee.isCheckmate(isInCheck, pieces)) {
        setIsCheckmate(isInCheck);
        setGameState(GameState.CHECKMATE);
      }
    } else {
      if (referee.isStalemate(currentTurn, pieces)) {
        setGameState(GameState.STALEMATE);
      }
    }
  }, [pieces, isInCheck, currentTurn, referee, gameState]);

  const generateBoard = React.useCallback(() => {
    const boardSquares: JSX.Element[] = [];
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const number = file + rank + 2;
        const piece = pieces.find(p => p.x === file && p.y === 7 - rank); 
        
        boardSquares.push(
          <Tile
            key={`${file},${rank}`}
            image={piece?.image}
            number={number}
          />
        );
      }
    }
    return boardSquares;
  }, [pieces]);

  function grabPiece(e: React.MouseEvent) {
    if (gameState !== GameState.ACTIVE && gameState !== GameState.CHECK) {
      return;
    }
  
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    if (element.classList.contains("chess-piece") && chessboard) {
      // Get board dimensions
      const boardRect = chessboard.getBoundingClientRect();
      const tileSize = boardRect.width / 8;
  
      // Calculate grid coordinates based on board's position
      setGridX(Math.floor((e.clientX - boardRect.left) / tileSize));
      setGridY(7 - Math.floor((e.clientY - boardRect.top) / tileSize));
  
      // Get the piece's current position and dimensions
      const pieceRect = element.getBoundingClientRect();
      
      // Calculate the cursor position within the piece
      const offsetX = e.clientX - pieceRect.left;
      const offsetY = e.clientY - pieceRect.top;
      
      // Store these offsets for use during movement
      element.dataset.offsetX = offsetX.toString();
      element.dataset.offsetY = offsetY.toString();
      
      // Position the piece under the cursor - these initial calculations are critical
      element.style.position = "fixed";
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
      element.style.width = `${tileSize}px`;
      element.style.height = `${tileSize}px`;
      element.style.zIndex = "1000"; // Ensure it appears above other elements
      
      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    if (gameState !== GameState.ACTIVE && gameState !== GameState.CHECK) {
      return;
    }
  
    if (activePiece) {
      // Get the stored offsets
      const offsetX = parseFloat(activePiece.dataset.offsetX || "0");
      const offsetY = parseFloat(activePiece.dataset.offsetY || "0");
      
      // Position element at cursor location, accounting for the initial grab offset
      activePiece.style.left = `${e.clientX - offsetX}px`;
      activePiece.style.top = `${e.clientY - offsetY}px`;
    }
  }

  function droppedPiece(e: React.MouseEvent) {
    if (gameState !== GameState.ACTIVE && gameState !== GameState.CHECK) {
        return;
    }
    
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
        const boardRect = chessboard.getBoundingClientRect();
        const tileSize = boardRect.width / 8;
        const x = Math.floor((e.clientX - boardRect.left) / tileSize);
        const y = 7 - Math.floor((e.clientY - boardRect.top) / tileSize);

        if (!isInsideBoard(x, y)) {
            activePiece.style.position = "relative";
            activePiece.style.removeProperty("top");
            activePiece.style.removeProperty("left");
            activePiece.style.removeProperty("width");
            activePiece.style.removeProperty("height");
            activePiece.style.removeProperty("zIndex");
            delete activePiece.dataset.offsetX;
            delete activePiece.dataset.offsetY;
            setActivePiece(null);
            return;
        }

        const currentPiece = pieces.find(
            (piece) => piece.x === gridX && piece.y === gridY
        );

        if (currentPiece) {
            const validMove = referee.isValidMove(gridX, gridY, x, y, currentPiece.type, currentPiece.team, pieces, enPassantTarget);

            if (validMove) {
              const fromNotation = `${horizontalAxis[gridX]}${verticalAxis[gridY]}`;
              const toNotation = `${horizontalAxis[x]}${verticalAxis[y]}`;
              const notation = `${fromNotation}${toNotation}`;

              // Send the move to the server
              if (props.onMove) {
                props.onMove(notation);
              }

              // Update the local board
              const updatedPieces = pieces
                .map((piece) => {
                  if (piece.x === currentPiece.x && piece.y === currentPiece.y) {
                    return { ...piece, x, y };
                  }

                  if (
                    currentPiece.type === PieceType.PAWN &&
                    enPassantTarget &&
                    x === enPassantTarget.x &&
                    y === enPassantTarget.y
                  ) {
                    const capturedPawnY = currentPiece.team === TeamType.OUR ? y - 1 : y + 1;
                    if (piece.x === x && piece.y === capturedPawnY) {
                      return null;
                    }
                  }

                  if (piece.x === x && piece.y === y) {
                    return null;
                  }

                  return piece;
                })
                .filter((piece): piece is Piece => piece !== null);

                const nextTurn =
                currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR;
                  const ourKingInCheck = referee.isKingInCheck(currentTurn, updatedPieces);
                  const opponentKingInCheck = referee.isKingInCheck(nextTurn, updatedPieces);

                  if (ourKingInCheck) {
                    setIsInCheck(currentTurn);
                    setGameState(GameState.CHECK);
                    if (referee.isCheckmate(currentTurn, updatedPieces)) {
                      setIsCheckmate(currentTurn);
                      setGameState(GameState.CHECKMATE);
                    }
                  } else if (opponentKingInCheck) {
                    setIsInCheck(nextTurn);
                    setGameState(GameState.CHECK);
                    if (referee.isCheckmate(nextTurn, updatedPieces)) {
                      setIsCheckmate(nextTurn);
                      setGameState(GameState.CHECKMATE);
                    }
                  } else {
                    setIsInCheck(null);
                    setGameState(GameState.ACTIVE);
                    if (referee.isStalemate(nextTurn, updatedPieces)) {
                      setGameState(GameState.STALEMATE);
                    }
                  }
    
                  setPieces(updatedPieces);
                  setCurrentTurn(nextTurn);
                } else {
                  activePiece.style.position = "relative";
                  activePiece.style.removeProperty("top");
                  activePiece.style.removeProperty("left");
                }
              }
              setActivePiece(null);
            }
}

  function generateFEN(pieces: Piece[]): string {
    let fen = "";
    for (let rank = 7; rank >= 0; rank--) {
      let emptyCount = 0;
      for (let file = 0; file < 8; file++) {
        const piece = pieces.find((p) => p.x === file && p.y === rank);
        if (piece) {
          let pieceChar = "";
          switch (piece.image) {
            case "/pawns/BlackPawn.svg":
              pieceChar = "p";
              break;
            case "/pawns/WhitePawn.svg":
              pieceChar = "P";
              break;
            case "/pawns/BlackRook.svg":
              pieceChar = "r";
              break;
            case "/pawns/WhiteRook.svg":
              pieceChar = "R";
              break;
            case "/pawns/BlackKnight.svg":
              pieceChar = "n";
              break;
            case "/pawns/WhiteKnight.svg":
              pieceChar = "N";
              break;
            case "/pawns/BlackBishop.svg":
              pieceChar = "b";
              break;
            case "/pawns/WhiteBishop.svg":
              pieceChar = "B";
              break;
            case "/pawns/BlackQueen.svg":
              pieceChar = "q";
              break;
            case "/pawns/WhiteQueen.svg":
              pieceChar = "Q";
              break;
            case "/pawns/BlackKing.svg":
              pieceChar = "k";
              break;
            case "/pawns/WhiteKing.svg":
              pieceChar = "K";
              break;
            default:
              console.error("Unknown piece image:", piece.image);
          }

          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += pieceChar;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (rank > 0) fen += "/";
    }
    return fen + " w KQkq - 0 1";
  }

  useEffect(() => {
    console.log(generateFEN(pieces));
  }, [pieces]);

const handlePromote = (pieceType: PieceType) => {
  if (!promotionPawn || !promotionPosition) return;

  const team = promotionPawn.team;
  const imageKey = team === TeamType.OUR ?
    getPieceSymbol(pieceType).toUpperCase() :
    getPieceSymbol(pieceType).toLowerCase();

  const image = pieceImages[imageKey as keyof typeof pieceImages] || '';

  const updatedPieces = pieces.map(p =>
    p === promotionPawn ?
      { ...p, type: pieceType, image, x: promotionPosition.x, y: promotionPosition.y } :
      p
  );

  setPieces(updatedPieces);
  setIsPromoting(false);
  setPromotionPawn(null);
  setPromotionPosition(null);
  setCurrentTurn(currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR);
}

	const getPromotionImage = (pieceType: PieceType) => {
		switch (pieceType) {
			case PieceType.QUEEN:
				return promotionPawn?.team === TeamType.OUR ? pieceImages.Q : pieceImages.q;
			case PieceType.ROOK:
				return promotionPawn?.team === TeamType.OUR ? pieceImages.R : pieceImages.r;
			case PieceType.BISHOP:
				return promotionPawn?.team === TeamType.OUR ? pieceImages.B : pieceImages.b;
			case PieceType.KNIGHT:
				return promotionPawn?.team === TeamType.OUR ? pieceImages.N : pieceImages.n;
			default:
				return "";
		}
	};

  function getAlgebraicNotation(
    piece: Piece,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    isCapture: boolean,
    promotionType?: PieceType
  ): string {
    const pieceSymbol = getPieceSymbol(piece.type);
    const fromSquare = `${horizontalAxis[fromX]}${verticalAxis[fromY]}`;
    const toSquare = `${horizontalAxis[toX]}${verticalAxis[toY]}`;
    const captureNotation = isCapture ? 'x' : '';

    if (piece.type === PieceType.KING && Math.abs(toX - fromX) === 2) {
      return toX > fromX ? 'O-O' : 'O-O-O';
    }

    if (piece.type === PieceType.PAWN && isCapture) {
      return `${horizontalAxis[fromX]}${captureNotation}${toSquare}`;
    }

    if (piece.type === PieceType.PAWN) {
      const promotionSuffix = promotionType ? `=${getPieceSymbol(promotionType)}` : '';
      return `${fromSquare}${toSquare}${promotionSuffix}`;
    }
    return `${pieceSymbol}${fromSquare}${captureNotation}${toSquare}`;
  }

  function getPieceSymbol(type: PieceType): string {
    switch (type) {
      case PieceType.KING: return 'K';
      case PieceType.QUEEN: return 'Q';
      case PieceType.ROOK: return 'R';
      case PieceType.BISHOP: return 'B';
      case PieceType.KNIGHT: return 'N';
      case PieceType.PAWN: return '';
      default: return '';
    }
  }

  function executeMove(notation: string): boolean {
    // Handle castling notation
    console.log(`Executing move: ${notation}`);
    if (notation === 'O-O' || notation === 'O-O-O') {
      return executeCastling(notation);
    }

    // Handle standard notation
    const regex = /^([a-h][1-8])([a-h][1-8])(=[QRBN])?$/;
    const match = notation.match(regex);

    if (!match) return false;

    const [, from, to, promotion] = match;
    const fromX = horizontalAxis.indexOf(from[0]);
    const fromY = verticalAxis.indexOf(from[1]);
    const toX = horizontalAxis.indexOf(to[0]);
    const toY = verticalAxis.indexOf(to[1]);

    const piece = pieces.find(p => p.x === fromX && p.y === fromY);

    if (!piece) return false;

    const validMove = referee.isValidMove(fromX, fromY, toX, toY, piece.type, piece.team, pieces, enPassantTarget);

    if (validMove) {
      const updatedPieces = pieces.map(p => {
        if (p === piece) {
          return { ...p, x: toX, y: toY };
        }
        if (p.x === toX && p.y === toY) {
          return null;
        }
        return p;
      }).filter((p): p is Piece => p !== null);

      if (promotion) {
        const promotionType = getPromotionTypeFromSymbol(promotion[1]);
        if (promotionType !== undefined) {
          const promotedPiece = updatedPieces.find(p => p.x === toX && p.y === toY);
          if (promotedPiece) {
            promotedPiece.type = promotionType;
            promotedPiece.image = piece.team === TeamType.OUR ?
              getPieceImage(promotionType, true) :
              getPieceImage(promotionType, false);
          }
        }
      }

      setPieces(updatedPieces);
      setCurrentTurn(currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR);
      return true;
    }

    return false;
  }

  function executeCastling(notation: string): boolean {
    const team = currentTurn;
    const rank = team === TeamType.OUR ? 0 : 7;
    const king = pieces.find(p =>
      p.x === 4 &&
      p.y === rank &&
      p.type === PieceType.KING &&
      p.team === team
    );

    if (!king) return false;

    const isKingSide = notation === 'O-O';
    const rookX = isKingSide ? 7 : 0;
    const rook = pieces.find(
      p => p.x === rookX &&
      p.y === rank &&
      p.type === PieceType.ROOK &&
      p.team === team
    );

    if (!rook) return false;

    const newKingX = isKingSide ? 6 : 2;
    const newRookX = isKingSide ? 5 : 3;
    const castlingPath = isKingSide ? [5, 6] : [1, 2, 3];

    const isPathClear = castlingPath.every(
      pathX => !pieces.find(p => p.x === pathX && p.y === rank)
    );

    if (isPathClear) {
      const updatedPieces = pieces.map(p => {
        if (p === king) {
          return { ...p, x: newKingX };
        }
        if (p === rook) {
          return { ...p, x: newRookX };
        }
        return p;
      });

      setPieces(updatedPieces);

      // Update castling rights
      if (team === TeamType.OUR) {
        setCastlingRights({
          ...castlingRights,
          whiteKingSide: false,
          whiteQueenSide: false,
        });
      } else {
        setCastlingRights({
          ...castlingRights,
          blackKingSide: false,
          blackQueenSide: false,
        });
      }

      setCurrentTurn(currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR);
      console.log(notation); // Log the castling move
      return true;
    }

    return false;
  }

  function getPromotionTypeFromSymbol(symbol: string): PieceType | undefined {
    switch (symbol) {
      case 'Q': return PieceType.QUEEN;
      case 'R': return PieceType.ROOK;
      case 'B': return PieceType.BISHOP;
      case 'N': return PieceType.KNIGHT;
      default: return undefined;
    }
  }

  function getPieceImage(type: PieceType, isWhite: boolean): string {
    switch (type) {
      case PieceType.QUEEN: return isWhite ? pieceImages.Q : pieceImages.q;
      case PieceType.ROOK: return isWhite ? pieceImages.R : pieceImages.r;
      case PieceType.BISHOP: return isWhite ? pieceImages.B : pieceImages.b;
      case PieceType.KNIGHT: return isWhite ? pieceImages.N : pieceImages.n;
      default: return '';
    }
  }


  return (
    <div
      onMouseMove={(e: React.MouseEvent) => movePiece(e)}
      onMouseDown={(e: React.MouseEvent) => grabPiece(e)}
      onMouseUp={(e: React.MouseEvent) => droppedPiece(e)}
      className="relative bg-[#ff0000] w-full max-w-[90vmin] mx-auto aspect-square grid grid-cols-8 text-black"
      ref={chessboardRef}
    >
      {generateBoard()}
      {isPromoting && promotionPawn && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-black/50">
          <div className="bg-white p-4 rounded-md shadow-lg w-full max-w-[300px]">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handlePromote(PieceType.QUEEN)} className="hover:bg-gray-100 p-2">
                <img
                  src={getPromotionImage(PieceType.QUEEN)}
                  alt="Queen"
                  className="w-full aspect-square"
                />
              </button>
              <button onClick={() => handlePromote(PieceType.ROOK)} className="hover:bg-gray-100">
                <img
                  src={getPromotionImage(PieceType.ROOK)}
                  alt="Rook"
                  className="w-[calc(100%/4)] aspect-square"
                />
              </button>
              <button onClick={() => handlePromote(PieceType.BISHOP)} className="hover:bg-gray-100">
                <img
                  src={getPromotionImage(PieceType.BISHOP)}
                  alt="Bishop"
                  className="w-[calc(100%/4)] aspect-square"
                />
              </button>
              <button onClick={() => handlePromote(PieceType.KNIGHT)} className="hover:bg-gray-100">
                <img
                  src={getPromotionImage(PieceType.KNIGHT)}
                  alt="Knight"
                  className="w-[calc(100%/4)] aspect-square"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  );
  export default Chessboard;
