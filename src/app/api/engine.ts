// src/api/engine.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ChessGame } from '@/app/utils/chess';
import { WsClient } from '@/app/lib/ws-client';

const engineBridge = new WsClient('./path/to/your/rust/engine');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        if (req.body.action === 'initialize') {
          await engineBridge.initialize();
          res.status(200).json({ success: true });
        } else if (req.body.action === 'analyze') {
          const fen = req.body.fen || new ChessGame().toFEN();
          await engineBridge.setPosition(fen);
          const bestMove = await engineBridge.startSearch();
          res.status(200).json({ bestMove });
        }
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
