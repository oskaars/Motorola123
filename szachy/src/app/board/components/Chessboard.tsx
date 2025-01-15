import { NextPage } from 'next';

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Chessboard() {
    let board = [];

    for(let j = verticalAxis.length-1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            const number = j +i + 2;

            if(number % 2 === 0) {
                board.push(<div className="w-[100px] h-[100px] bg-[#a16f5a]">[{horizontalAxis[i]}{verticalAxis[j]}]</div>)
            }
            else{
                board.push(<div className="w-[100px] h-[100px] bg-[#ecd3b8]">[{horizontalAxis[i]}{verticalAxis[j]}]</div>)
            }
        }
    }
    return <div className="bg-[#ff0000] w-[800px] h-[800px] grid grid-cols-8 text-black">{board}</div>
}