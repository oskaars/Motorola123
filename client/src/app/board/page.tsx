import { NextPage } from 'next';
import Chessboard from './components/Chessboard';

const Board: NextPage = () => {
    return (
        <>
            <div>
                <div className="grid place-content-center h-screen bg-[#1a1a1a]">
                    <Chessboard />
                </div>    
            </div>
        </>
    );
};

export default Board;