import { NextApiRequest, NextApiResponse } from 'next';
import { ChessGame } from '@/app/utils/chess';
import { UciWebSocketClient, TimeControlParams } from '@/app/lib/ws-client';

//dsdsds
const engineBridge = new UciWebSocketClient('', 'ws://ai.gambit.plus');

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
          const timeControl: TimeControlParams = {
            wtime: req.body.wtime,
            btime: req.body.btime,
            winc: req.body.winc,
            binc: req.body.binc,
            movestogo: req.body.movestogo,
            movetime: req.body.movetime,
            depth: req.body.depth
          };
          
          await engineBridge.setPosition(fen);
          const bestMove = await engineBridge.startSearch(timeControl);
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
