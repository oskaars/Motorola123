// types/types.d.ts
export type ChessPiece = 'P' | 'R' | 'N' | 'B' | 'Q' | 'K' | 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | null;

export type ChessPosition = {
    [key: string]: ChessPiece;
};

export interface ChessMove {
    from: string;  // e.g., "e2"
    to: string;    // e.g., "e4"
    promotion?: 'Q' | 'R' | 'B' | 'N';
}

export interface ChessMessage {
    type: 'move' | 'invalidMove' | 'status' | 'connection';
    move?: ChessMove;
    position?: ChessPosition;
    notation?: string;
    message?: string;
}