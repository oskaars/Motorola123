import Tile from "./Tile";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
    image: string;
    x: number;
    y: number;
}

const pieces: Piece[] = [];

for(let i =0; i < 8; i++) {
pieces.push({image: "pawns/BlackPawn.svg", x: i, y: 6})
}

for(let i =0; i < 8; i++) {
    pieces.push({image: "pawns/WhitePawn.svg", x: i, y: 1})
    }

pieces.push({image: "pawns/BlackRook.svg", x: 0, y: 7})
pieces.push({image: "pawns/BlackRook.svg", x: 7, y: 7})
pieces.push({image: "pawns/BlackKnightsvg", x: 1, y: 7})
pieces.push({image: "pawns/BlackKnight.svg", x: 6, y: 7})
pieces.push({image: "pawns/BlackBishop.svg", x: 2, y: 7})
pieces.push({image: "pawns/BlackBishop.svg", x: 5, y: 7})
pieces.push({image: "pawns/BlackQueen.svg", x: 3, y: 7})
pieces.push({image: "pawns/BlackKing.svg", x: 4, y: 7})

pieces.push({image: "pawns/WhiteRook.svg", x: 0, y: 0})
pieces.push({image: "pawns/WhiteRook.svg", x: 7, y: 0})
pieces.push({image: "pawns/WhiteKnightsvg", x: 1, y: 0})
pieces.push({image: "pawns/WhiteKnight.svg", x: 6, y: 0})
pieces.push({image: "pawns/WhiteBishop.svg", x: 2, y: 0})
pieces.push({image: "pawns/WhiteBishop.svg", x: 5, y: 0})
pieces.push({image: "pawns/WhiteQueen.svg", x: 3, y: 0})
pieces.push({image: "pawns/WhiteKing.svg", x: 4, y: 0})



export default function Chessboard() {
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

            board.push(<Tile image={image} number={number} />)
        }
    }
    return <div className="bg-[#ff0000] w-[800px] h-[800px] grid grid-cols-8 text-black">{board}</div>
}