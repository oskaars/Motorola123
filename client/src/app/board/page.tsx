import { NextPage } from 'next';
import Chessboard from './components/Chessboard';

const Board: NextPage = () => {
    return (
        <>
            <div className="grid place-content-center h-screen bg-[#1a1a1a] pt-[5vh]">
                <Chessboard />
            </div>    
        </>
    );
};

export default Board;