"use client";
import React, { JSX, useRef, useState } from "react";
import Tile from "./Tile";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
    image: string;
    x: number;
    y: number;
}

const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const pieceImages = {
    'p': 'pawns/BlackPawn.svg',
    'r': 'pawns/BlackRook.svg',
    'n': 'pawns/BlackKnight.svg',
    'b': 'pawns/BlackBishop.svg',
    'q': 'pawns/BlackQueen.svg',
    'k': 'pawns/BlackKing.svg',
    'P': 'pawns/WhitePawn.svg',
    'R': 'pawns/WhiteRook.svg',
    'N': 'pawns/WhiteKnight.svg',
    'B': 'pawns/WhiteBishop.svg',
    'Q': 'pawns/WhiteQueen.svg',
    'K': 'pawns/WhiteKing.svg'
};

function loadPositionFromFEN(fen: string): Piece[] {
    const pieces: Piece[] = [];
    const fenBoard = fen.split(' ')[0];
    let file = 0;
    let rank = 7;

    for (const symbol of fenBoard) {
        if (symbol === '/') {
            file = 0; 
            rank--;
        } else if (!isNaN(parseInt(symbol))) {
            file += parseInt(symbol); 
        } else {
            const image = pieceImages[symbol as keyof typeof pieceImages];
            if (image) {
                pieces.push({ image, x: file, y: rank });
            }
            file++;
        }
    }
    return pieces;
}

export default function Chessboard() {
    const [pieces, setPieces] = useState<Piece[]>(loadPositionFromFEN(startFEN));
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [gridX, setGridX] = useState(0);
    const [gridY, setGridY] = useState(0);
    const chessboardRef = useRef<HTMLDivElement>(null);
    
    function grabPiece(e: React.MouseEvent) {
        const element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;
        if (element.classList.contains('chess-piece') && chessboard) {
            setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
            setGridY(Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100)));
            const x = e.clientX - 50;
            const y = e.clientY - 50;
            element.style.position = 'absolute';
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            setActivePiece(element);
        }
    }

    function movePiece(e: React.MouseEvent) {
        if (activePiece) {
            const x = e.clientX - 50;
            const y = e.clientY - 50;
            activePiece.style.position = 'absolute';
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
        }
    }

    function droppedPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100); 
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100));

            setPieces((prevPieces) => 
                prevPieces.map((piece) => 
                    (piece.x === gridX && piece.y === gridY)
                        ? { ...piece, x, y }
                        : piece
                )
            );
            setActivePiece(null);
        }
    }

    function generateFEN(pieces: Piece[]): string {
        let fen = '';
        for (let rank = 7; rank >= 0; rank--) {
            let emptyCount = 0;
            for (let file = 0; file < 8; file++) {
                const piece = pieces.find(p => p.x === file && p.y === rank);
                if (piece) {
                    let pieceChar = '';
                    switch (piece.image) {
                        case 'pawns/BlackPawn.svg':
                            pieceChar = 'p';
                            break;
                        case 'pawns/WhitePawn.svg':
                            pieceChar = 'P';
                            break;
                        case 'pawns/BlackRook.svg':
                            pieceChar = 'r'; 
                            break;
                        case 'pawns/WhiteRook.svg':
                            pieceChar = 'R'; 
                            break;
                        case 'pawns/BlackKnight.svg':
                            pieceChar = 'n'; 
                            break;
                        case 'pawns/WhiteKnight.svg':
                            pieceChar = 'N'; 
                            break;
                        case 'pawns/BlackBishop.svg':
                            pieceChar = 'b';
                            break;
                        case 'pawns/WhiteBishop.svg':
                            pieceChar = 'B'; 
                            break;
                        case 'pawns/BlackQueen.svg':
                            pieceChar = 'q';
                            break;
                        case 'pawns/WhiteQueen.svg':
                            pieceChar = 'Q'; 
                            break;
                        case 'pawns/BlackKing.svg':
                            pieceChar = 'k'; 
                            break;
                        case 'pawns/WhiteKing.svg':
                            pieceChar = 'K';
                            break;
                        default:
                            console.error('Unknown piece image:', piece.image);
                    }
    
                    if (emptyCount > 0) {
                        fen += emptyCount; 
                        emptyCount = 0;
                    }
                    fen += pieceChar; // Append the correct character for the piece
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) {
                fen += emptyCount; 
            }
            if (rank > 0) fen += '/'; 
        }
        return fen + ' w KQkq - 0 1'; 
    }
    
    console.log(generateFEN(pieces));
    
    let board: JSX.Element[] = [];
    
    for (let j = verticalAxis.length - 1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            const number = j + i + 2;
            let image: string | undefined;

            pieces.forEach(p => {
                if (p.x === i && p.y === j) {
                    image = p.image;
                }
            });

            board.push(<Tile key={`${i},${j}`} image={image} number={number} />);
        }
    }

    return (
        <div
            onMouseMove={(e) => movePiece(e)}
            onMouseDown={(e) => grabPiece(e)}
            onMouseUp={(e) => droppedPiece(e)}
            className="bg-[#ff0000] w-[800px] h-[800px] grid grid-cols-8 text-black"
            ref={chessboardRef}
        >
            {board}
        </div>
    );
}
