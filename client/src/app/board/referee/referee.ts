import { PieceType, TeamType, Piece, Position } from '../components/Chessboard';

export default class Referee {
    getCastlingRookMove(kingFromX: number, kingToX: number, kingY: number): { fromX: number; toX: number } | null {
        if (Math.abs(kingToX - kingFromX) !== 2) return null;

        const isKingSide = kingToX > kingFromX;
        return {
            fromX: isKingSide ? 7 : 0,
            toX: isKingSide ? 5 : 3
        };
    }

    private canPieceAttackSquare(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[]): boolean {
        switch (type) {
            case PieceType.PAWN: {
                const pawnDirection = team === TeamType.OUR ? 1 : -1;
                return Math.abs(x - px) === 1 && y - py === pawnDirection;
            }
            case PieceType.KNIGHT: {
                const xDistance = Math.abs(x - px);
                const yDistance = Math.abs(y - py);
                return (xDistance === 2 && yDistance === 1) || (xDistance === 1 && yDistance === 2);
            }
            case PieceType.BISHOP: {
                const xDistance = Math.abs(x - px);
                const yDistance = Math.abs(y - py);
                if (xDistance === yDistance) {
                    return this.isDiagonalPathClear(px, py, x, y, boardState);
                }
                return false;
            }
            case PieceType.ROOK: {
                if (x === px || y === py) {
                    return this.isStraightPathClear(px, py, x, y, boardState);
                }
                return false;
            }
            case PieceType.QUEEN: {
                const xDistance = Math.abs(x - px);
                const yDistance = Math.abs(y - py);
                if (x === px || y === py) {
                    return this.isStraightPathClear(px, py, x, y, boardState);
                }
                if (xDistance === yDistance) {
                    return this.isDiagonalPathClear(px, py, x, y, boardState);
                }
                return false;
            }
            case PieceType.KING: {
                const xDistance = Math.abs(x - px);
                const yDistance = Math.abs(y - py);
                return xDistance <= 1 && yDistance <= 1;
            }
            default:
                return false;
        }
    }

    private isDiagonalPathClear(px: number, py: number, x: number, y: number, boardState: Piece[]): boolean {
        const xDirection = x > px ? 1 : -1;
        const yDirection = y > py ? 1 : -1;
        const distance = Math.abs(x - px);

        for (let i = 1; i < distance; i++) {
            if (this.tileIsOccupied(px + i * xDirection, py + i * yDirection, boardState)) {
                return false;
            }
        }
        return true;
    }

    private isStraightPathClear(px: number, py: number, x: number, y: number, boardState: Piece[]): boolean {
        const xDirection = x > px ? 1 : x < px ? -1 : 0;
        const yDirection = y > py ? 1 : y < py ? -1 : 0;
        const distance = Math.max(Math.abs(x - px), Math.abs(y - py));

        for (let i = 1; i < distance; i++) {
            if (this.tileIsOccupied(px + i * xDirection, py + i * yDirection, boardState)) {
                return false;
            }
        }
        return true;
    }

    tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
        return boardState.some(piece => piece.x === x && piece.y === y);
    }

    tileIsOccupiedByOpponent(x: number, y: number, boardState: Piece[], team: TeamType): boolean {
        const piece = boardState.find(piece => piece.x === x && piece.y === y);
        return piece ? piece.team !== team : false;
    }

    isKingInCheck(team: TeamType, boardState: Piece[]): boolean {
        const king = boardState.find(p => p.type === PieceType.KING && p.team === team);
        if (!king) return false;

        return boardState.some(piece =>
            piece.team !== team &&
            this.canPieceAttackSquare(piece.x, piece.y, king.x, king.y, piece.type, piece.team, boardState)
        );
    }

    isCheckmate(team: TeamType, boardState: Piece[]): boolean {
        if (!this.isKingInCheck(team, boardState)) {
            return false;
        }
        return !this.hasLegalMoves(team, boardState);
    }

    isStalemate(team: TeamType, boardState: Piece[]): boolean {
        if (this.isKingInCheck(team, boardState)) return false;
        return !this.hasLegalMoves(team, boardState);
    }

    private hasLegalMoves(team: TeamType, boardState: Piece[]): boolean {
        for (const piece of boardState) {
            if (piece.team === team) {
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        if (this.isValidMove(piece.x, piece.y, x, y, piece.type, piece.team, boardState, null, undefined)) {
                            const simulatedBoard = this.simulateMove(piece.x, piece.y, x, y, boardState);
                            if (simulatedBoard && !this.isKingInCheck(team, simulatedBoard)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    private simulateMove(px: number, py: number, x: number, y: number, boardState: Piece[]): Piece[] | null {
        const piece = boardState.find(p => p.x === px && p.y === py);
        if (!piece) return null;
        const simulatedBoard = boardState.map(p => ({ ...p }));
        const movingPiece = simulatedBoard.find(p => p.x === px && p.y === py);
        const targetPiece = simulatedBoard.find(p => p.x === x && p.y === y);

        if (!movingPiece) return null;

        movingPiece.x = x;
        movingPiece.y = y;

        if (targetPiece) {
            simulatedBoard.splice(simulatedBoard.indexOf(targetPiece), 1);
        }

        return simulatedBoard;
    }

    isValidMove(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[], enPassantTarget: Position | null, castlingRights?: { whiteKingSide: boolean; whiteQueenSide: boolean; blackKingSide: boolean; blackQueenSide: boolean; }): boolean {
        if (x < 0 || x > 7 || y < 0 || y > 7) return false;

        const targetPiece = boardState.find(piece => piece.x === x && piece.y === y);
        if (targetPiece && targetPiece.team === team) return false;

        const simulatedBoard = boardState.map(p => ({ ...p }));
        const movingPiece = simulatedBoard.find(p => p.x === px && p.y === py);

        if (movingPiece) {
            const originalX = movingPiece.x;
            const originalY = movingPiece.y;
            movingPiece.x = x;
            movingPiece.y = y;

            if (this.isKingInCheck(team, simulatedBoard)) {
                return false;
            }

            movingPiece.x = originalX;
            movingPiece.y = originalY;
        }

        switch (type) {
            case PieceType.PAWN:
                return this.isValidPawnMove(px, py, x, y, team, boardState, enPassantTarget);
            case PieceType.KNIGHT:
                return this.canPieceAttackSquare(px, py, x, y, type, team, boardState);
            case PieceType.BISHOP:
                return this.canPieceAttackSquare(px, py, x, y, type, team, boardState);
            case PieceType.ROOK:
                return this.canPieceAttackSquare(px, py, x, y, type, team, boardState);
            case PieceType.QUEEN:
                return this.canPieceAttackSquare(px, py, x, y, type, team, boardState);
            case PieceType.KING:
                return this.isValidKingMove(px, py, x, y, team, boardState, castlingRights);
            default:
                return false;
        }
    }

    private isValidPawnMove(px: number, py: number, x: number, y: number, team: TeamType, boardState: Piece[], enPassantTarget: Position | null): boolean {
        const pawnDirection = team === TeamType.OUR ? 1 : -1;
        const startingRow = team === TeamType.OUR ? 1 : 6;

        if (px === x && y - py === pawnDirection && !this.tileIsOccupied(x, y, boardState)) {
            return true;
        } else if (px === x && py === startingRow && y - py === 2 * pawnDirection) {
            return !this.tileIsOccupied(x, y, boardState) &&
                !this.tileIsOccupied(x, y - pawnDirection, boardState);
        }

        if (Math.abs(x - px) === 1 && y - py === pawnDirection) {
            if (this.tileIsOccupiedByOpponent(x, y, boardState, team)) {
                return true;
            }

            // En passant
            if (enPassantTarget && x === enPassantTarget.x && y === enPassantTarget.y) {
                return true;
            }
        }

        return false;
    }

    private isValidKingMove(px: number, py: number, x: number, y: number, team: TeamType, boardState: Piece[], castlingRights?: { whiteKingSide: boolean; whiteQueenSide: boolean; blackKingSide: boolean; blackQueenSide: boolean; }): boolean {
        const xDistance = Math.abs(x - px);
        const yDistance = Math.abs(y - py);

        if (xDistance <= 1 && yDistance <= 1) {
            return true;
        }

        if (castlingRights && xDistance === 2 && yDistance === 0) {
            if ((team === TeamType.OUR && py !== 0) || (team === TeamType.OPPONENTS && py !== 7)) {
                return false;
            }
            if (px !== 4) return false;

            if (this.isKingInCheck(team, boardState)) return false;

            const isKingSide = x > px;
            const rookX = isKingSide ? 7 : 0;
            const castlingPath = isKingSide ? [5, 6] : [1, 2, 3];
            const finalKingX = isKingSide ? 6 : 2;
            const finalRookX = isKingSide ? 5 : 3;

            if (team === TeamType.OUR) {
                if (isKingSide && !castlingRights.whiteKingSide) return false;
                if (!isKingSide && !castlingRights.whiteQueenSide) return false;
            } else {
                if (isKingSide && !castlingRights.blackKingSide) return false;
                if (!isKingSide && !castlingRights.blackQueenSide) return false;
            }

            const rook = boardState.find(p =>
                p.x === rookX &&
                p.y === py &&
                p.type === PieceType.ROOK &&
                p.team === team
            );
            if (!rook) return false;

            for (const pathX of castlingPath) {
                if (this.tileIsOccupied(pathX, py, boardState)) {
                    return false;
                }
            }

            for (const pathX of [px, ...castlingPath]) {
                const simulatedBoard = boardState.map(p => ({ ...p }));
                const kingPiece = simulatedBoard.find(p => p.type === PieceType.KING && p.team === team);
                if (kingPiece) {
                    kingPiece.x = pathX;
                    if (this.isKingInCheck(team, simulatedBoard)) {
                        return false;
                    }
                }
            }

            const finalBoard = boardState.map(p => ({ ...p }));
            const kingPiece = finalBoard.find(p => p.type === PieceType.KING && p.team === team);
            const rookPiece = finalBoard.find(p => p.x === rookX && p.y === py);

            if (kingPiece && rookPiece) {
                kingPiece.x = finalKingX;
                rookPiece.x = finalRookX;
                if (this.isKingInCheck(team, finalBoard)) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}
