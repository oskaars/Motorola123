import Tile from "./Tile";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
    image: string;
    x: number;
    y: number;
}

const pieces: Piece[] = [];

pieces.push({iamge: "https://raw.githubusercontent.com/oskaars/Motorola123/943156290e64e61048f3e32a081cd990dee12e92/client/src/app/board/pawns/BlackPawn.svg?token=BHZ2SHK23OMCUUF7DU2EPX3HQ7OEU", x: 0, y: 1})

export default function Chessboard() {
    let board = [];

    for(let j = verticalAxis.length-1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            const number = j +i + 2;
            let image = undefined;

            pieces.forEach(p => {
            })

            board.push(<Tile image={image} number={number} />)
        }
    }
    return <div className="bg-[#ff0000] w-[800px] h-[800px] grid grid-cols-8 text-black">{board}</div>
}