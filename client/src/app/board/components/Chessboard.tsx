"use client";
import React from "react";
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

    let activePiece: HTMLElement | null = null;

    function grabPiece(e: React.MouseEvent) {
        const element = e.target as HTMLElement;
        if(element.classList.contains('chess-piece')) {
            const x = e.clientX -50;
            const y = e.clientY -50;
            element.style.position = 'absolute';
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;

            activePiece = element;
        }
    }

    function movePiece(e: React.MouseEvent) {
     if(activePiece && activePiece.classList.contains('chess-piece')) {
            const x = e.clientX -50;
            const y = e.clientY -50;
            activePiece.style.position = 'absolute';
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;
        }
    }

    function droppedPiece(e: React.MouseEvent) {
        if(activePiece) {
            activePiece = null;
        }
    }

export default function Chessboard() {
    const pieces = loadPositionFromFEN(startFEN);
    let board = [];

    for(let j = verticalAxis.length-1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            const number = j +i + 2;
            let image = undefined;

            pieces.forEach(p => {
                if(p.x === i && p.y === j) {
                    image = p.image;
                }
            })

            board.push(<Tile key={`${i},${j}`} image={image} number={number} />)
        }
    }
    return <div
    onMouseMove={(e) => movePiece(e)}
    onMouseDown={(e) => grabPiece(e)}
    onMouseUp={(e) => droppedPiece(e)}
    className="bg-[#ff0000] w-[800px] h-[800px] grid grid-cols-8 text-black"
    >
        {board}
    </div>
}