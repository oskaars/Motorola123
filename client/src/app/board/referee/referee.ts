import { PieceType, TeamType, Piece } from '../components/Chessboard';

export default class Referee {
    tileIsOccupied(x: number, y: number, boardState: Piece[]) {
        console.log("Sprawdzam czy pole jest zajęte");

        const piece = boardState.find(piece => piece.x === x && piece.y === y)
        if (piece){
            return true;
        } else {
            return false;
        }
    }

    isValidMove(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[]): boolean {
        console.log(`Typ pionka: ${type}, Drużyna: ${team}`);

        if(type == PieceType.PAWN) {
            const specialRow = (team === TeamType.OUR) ? 1 : 6;
            const pawnDirection = (team === TeamType.OUR) ? 1 : -1;

            if(px === x && py === specialRow && y - py === 2*pawnDirection){
                if(!this.tileIsOccupied(x, y, boardState) && !this.tileIsOccupied(x, y - pawnDirection, boardState)){
                    return true;
                }
            } else if(px === x && y - py === pawnDirection){
                if(!this.tileIsOccupied(x, y, boardState)){
                    return true;
                }
            }
        }
        console.log("Niepoprawny ruch");
        return false; 
    }
}