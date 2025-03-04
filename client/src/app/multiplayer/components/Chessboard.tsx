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
  const Chessboard = forwardRef((props, ref: ForwardedRef<any>) => {
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

  const generateBoard = () => {
    const boardSquares: JSX.Element[] = [];
    for (let j = verticalAxis.length - 1; j >= 0; j--) {
      for (let i = 0; i < horizontalAxis.length; i++) {
        const number = j + i + 2;
        let image: string | undefined;
        pieces.forEach((p) => {
          if (p.x === i && p.y === j) {
            image = p.image;
          }
        });

        boardSquares.push(
          <Tile key={`${i},${j}`} image={image} number={number} />
        );
      }
    }
    return boardSquares;
  };

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
      
      // Position the piece centered under cursor
      let x = e.clientX - (tileSize / 2);
      let y = e.clientY - (tileSize / 2);
  
      // Calculate boundaries relative to the board
      const boardLeft = boardRect.left;
      const boardTop = boardRect.top;
      const boardRight = boardRect.right - tileSize;
      const boardBottom = boardRect.bottom - tileSize;
  
      // Keep piece within board boundaries
      x = Math.max(boardLeft, Math.min(x, boardRight));
      y = Math.max(boardTop, Math.min(y, boardBottom));
   
      // Position element absolutely
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.width = `${tileSize}px`;
      element.style.height = `${tileSize}px`;
  
      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    if (gameState !== GameState.ACTIVE && gameState !== GameState.CHECK) {
      return;
    }
  
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      // Get board dimensions
      const boardRect = chessboard.getBoundingClientRect();
      const tileSize = boardRect.width / 8;
      
      // Calculate boundaries relative to the board
      const minX = boardRect.left;
      const minY = boardRect.top;
      const maxX = boardRect.right - tileSize;
      const maxY = boardRect.bottom - tileSize;
  
      // Keep piece centered under cursor and within boundaries
      const x = Math.min(Math.max(e.clientX - (tileSize / 2), minX), maxX);
      const y = Math.min(Math.max(e.clientY - (tileSize / 2), minY), maxY);
  
      // Position element absolutely
      activePiece.style.position = "absolute";
      activePiece.style.left = `${x}px`;
      activePiece.style.top = `${y}px`;
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
        setActivePiece(null);
        return;
      }

      const currentPiece = pieces.find(
        (piece) => piece.x === gridX && piece.y === gridY
      );

      if (currentPiece) {
        if (currentPiece.type === PieceType.KING && Math.abs(x - gridX) === 2) {
          const isKingSide = x > gridX;
          const rookX = isKingSide ? 7 : 0;
          const rook = pieces.find(
            (p) =>
              p.x === rookX &&
              p.y === y &&
              p.type === PieceType.ROOK &&
              p.team === currentPiece.team
          );

          if (rook) {
            const newKingX = isKingSide ? 6 : 2;
            const newRookX = isKingSide ? 5 : 3;

            const castlingPath = isKingSide ? [5, 6] : [1, 2, 3];
						const simulatedBoard = pieces.map((p) => {
              if (p === currentPiece) {
                return { ...p, x: newKingX, y: y };
              } else if (p === rook) {
                return { ...p, x: newRookX, y: y };
              } else {
                return { ...p };
              }
            });

            const wouldBeInCheck = referee.isKingInCheck(
              currentPiece.team,
              simulatedBoard
            );
            if (wouldBeInCheck) {
              activePiece.style.position = "relative";
              activePiece.style.removeProperty("top");
              activePiece.style.removeProperty("left");
              setActivePiece(null);
              return;
            }

            const isPathClear = castlingPath.every(
              (pathX) => !pieces.find((p) => p.x === pathX && p.y === y)
            );

            if (isPathClear) {
              const updatedPieces = pieces.map((p) => {
                if (p === currentPiece) {
                  return { ...p, x: newKingX, y: y };
                }
                if (p === rook) {
                  return { ...p, x: newRookX, y: y };
                }
                return p;
              });

              setPieces(updatedPieces);

              if (currentPiece.team === TeamType.OUR) {
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
              setCurrentTurn(
                currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR
              );
              return;
            }
          }
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
          setActivePiece(null);
          return;
        }

        const validMove = referee.isValidMove(gridX, gridY, x, y, currentPiece.type, currentPiece.team, pieces, enPassantTarget);

        if (validMove) {
          if (isPawnPromotionMove(currentPiece, x, y)) {
            const snappedPawn = { ...currentPiece, x, y };
            const updatedPieces = pieces
              .map(p => {
                if (p.x === x && p.y === y) return null;
                if (p === currentPiece) return snappedPawn;
                return p;
              })
              .filter((p): p is Piece => p !== null);
            const isCapture = pieces.some(p => p.x === x && p.y === y);
            const moveNotation = getAlgebraicNotation(currentPiece, gridX, gridY, x, y, isCapture);
            console.log(`${moveNotation} (promoting)`);

            setPieces(updatedPieces);
            setPromotionPawn(snappedPawn);
            setPromotionPosition({ x, y });
            setIsPromoting(true);
            activePiece.style.position = "relative";
            activePiece.style.removeProperty("top");
            activePiece.style.removeProperty("left");
            setActivePiece(null);
            return;
          }

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

        const isCapture = pieces.some(p => p.x === x && p.y === y);
        const moveNotation = getAlgebraicNotation(
          currentPiece,
          gridX,
          gridY,
          x,
          y,
          isCapture
        );
        console.log(moveNotation);

        if (
          currentPiece.type === PieceType.PAWN &&
          Math.abs(gridY - y) === 2
        ) {
          const enPassantY = (gridY + y) / 2;
          setEnPassantTarget({ x, y: enPassantY });
        } else {
          setEnPassantTarget(null);
        }

          const nextTurn =
            currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR;
          const ourKingInCheck = referee.isKingInCheck(
            currentTurn,
            updatedPieces
          );
          const opponentKingInCheck = referee.isKingInCheck(
            nextTurn,
            updatedPieces
          );

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

  function isPawnPromotionMove(piece: Piece, targetX:number, targetY: number): boolean {
    return piece.type === PieceType.PAWN &&
           ((piece.team === TeamType.OUR && targetY === 7) ||
            (piece.team === TeamType.OPPONENTS && targetY === 0));
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

		let image = "";
		switch (pieceType) {
			case PieceType.QUEEN:
				image = promotionPawn.team === TeamType.OUR ? pieceImages.Q : pieceImages.q;
				break;
			case PieceType.ROOK:
				image = promotionPawn.team === TeamType.OUR ? pieceImages.R : pieceImages.r;
				break;
			case PieceType.BISHOP:
				image = promotionPawn.team === TeamType.OUR ? pieceImages.B : pieceImages.b;
				break;
			case PieceType.KNIGHT:
				image = promotionPawn.team === TeamType.OUR ? pieceImages.N : pieceImages.n;
				break;
			default:
				return;
		}
		const x = promotionPosition.x;
		const y = promotionPosition.y;

		const updatedPieces = pieces.map(p => {
      if (p === promotionPawn) {
        return { ...p, type: pieceType, image: image, x: x, y: y };
      }
      return p;
    });
    const moveNotation = getAlgebraicNotation(promotionPawn, promotionPawn.x, promotionPawn.y, x, y, false, pieceType);
    console.log(moveNotation);
		setPieces(updatedPieces);
		setIsPromoting(false);
		setPromotionPawn(null);
		setPromotionPosition(null);

		const nextTurn = currentTurn === TeamType.OUR ? TeamType.OPPONENTS : TeamType.OUR;
		setCurrentTurn(nextTurn);
	};

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

  function executeMove(moveNotation: string): boolean {
    const regex = /^([a-h][1-8])([a-h][1-8])(=[QRBN])?$/;
    const match = moveNotation.match(regex);

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

  function executeNotationMove(notation: string): boolean {
    // Handle castling
    if (notation === 'O-O' || notation === 'O-O-O') {
      const team = currentTurn;
      const rank = team === TeamType.OUR ? 0 : 7;
      const king = pieces.find(p =>
        p.x === 4 &&
        p.y === rank &&
        p.type === PieceType.KING &&
        p.team === team
      );

      if (king) {
        const isKingSide = notation === 'O-O';
        const rookX = isKingSide ? 7 : 0;
        const rook = pieces.find(
          p => p.x === rookX &&
          p.y === rank &&
          p.type === PieceType.ROOK &&
          p.team === team
        );

        if (rook) {
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
        }
      }
      return false;
    }

    // For non-castling moves, use the existing executeMove function
    return executeMove(notation);
  }

  return (
    <div
        onMouseMove={(e: React.MouseEvent) => movePiece(e)}
        onMouseDown={(e: React.MouseEvent) => grabPiece(e)}
        onMouseUp={(e: React.MouseEvent) => droppedPiece(e)}
        className="bg-[#ff0000] w-full aspect-square grid grid-cols-8 text-black"
        ref={chessboardRef}
      >
      {generateBoard()}
      {isPromoting && promotionPawn && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-black/50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="flex flex-col gap-2">
              <button onClick={() => handlePromote(PieceType.QUEEN)} className="hover:bg-gray-100">
                <img 
                  src={getPromotionImage(PieceType.QUEEN)} 
                  alt="Queen" 
                  className="w-[calc(100%/4)] aspect-square" 
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
