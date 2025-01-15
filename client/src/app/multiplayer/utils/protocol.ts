// utils/protocol.ts
import { ChessMessage } from "../types/types";

export const createMessage = (message: ChessMessage): string => {
    return JSON.stringify(message);
};

export const parseMessage = (message: string): ChessMessage | null => {
    try {
        return JSON.parse(message);
    } catch (e) {
        console.error("Failed to parse message:", message);
        return null;
    }
};