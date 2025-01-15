import { NextPage } from 'next';
import Chessboard from './components/Chessboard';

const Board: NextPage = () => {
    return (
        <div>
            <h1>Board</h1>
            <div className="grid justify-center">
                <Chessboard />
            </div>    
        </div>
    );
};

export default Board;