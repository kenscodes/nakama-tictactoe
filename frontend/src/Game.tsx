import { useState, useEffect } from 'react';
import { nakamaSocket, nakamaSession, nakamaClient } from './NakamaClient';
import type { MatchData } from '@heroiclabs/nakama-js';
import { ArrowLeft, Clock } from 'lucide-react';

const OpCode = {
    START: 1,
    UPDATE: 2,
    DONE: 3,
    MOVE: 4,
    REJECTED: 5,
} as const;

const Mark = {
    UNDEFINED: 0,
    X: 1,
    O: 2,
} as const;
type Mark = (typeof Mark)[keyof typeof Mark];

export default function Game({ matchId, setMatchId }: { matchId: string, setMatchId: (id: string | null) => void }) {
  const [board, setBoard] = useState<(Mark | null)[]>(Array(9).fill(null));
  const [myMark, setMyMark] = useState<Mark | null>(null);
  const [currentTurn, setCurrentTurn] = useState<Mark>(Mark.X);
  const [winner, setWinner] = useState<Mark | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [opponentName, setOpponentName] = useState<string>("Opponent");

  useEffect(() => {
     if (!nakamaSocket) return;

     nakamaSocket.onmatchdata = async (result: MatchData) => {
        const opc = result.op_code;
        if (opc === OpCode.REJECTED) return;

        // Decode Uint8Array correctly
        const dataStr = result.data ? new TextDecoder().decode(result.data) : null;
        let data: any = {};
        if (dataStr) {
           try { data = JSON.parse(dataStr); } catch (e) {}
        }

        if (opc === OpCode.START) {
           setBoard(data.board);
           setCurrentTurn(data.mark);
           setDeadline(data.deadline);
           if (nakamaSession && nakamaSession.user_id) {
              setMyMark(data.marks[nakamaSession.user_id]);
              const oppId = Object.keys(data.marks).find(id => id !== nakamaSession!.user_id);
              if (oppId) {
                  try {
                      // Fetch opponent's custom username from Nakama Database automatically
                      const users = await nakamaClient.getUsers(nakamaSession, [oppId]);
                      if (users.users && users.users.length > 0 && users.users[0].username) {
                          setOpponentName(users.users[0].username);
                      }
                  } catch(e) {}
              }
           }
        } 
        else if (opc === OpCode.UPDATE) {
           setBoard(data.board);
           setCurrentTurn(data.mark);
           setDeadline(data.deadline);
        }
        else if (opc === OpCode.DONE) {
           setBoard(data.board);
           setWinner(data.winner);
           setDeadline(null);
        }
     };

     // Timer sync interval
     const interval = setInterval(() => {
         if (deadline !== null) {
            const rem = Math.max(0, deadline - Math.floor(Date.now() / 1000));
            setTimeRemaining(rem);
         }
     }, 1000);

     return () => clearInterval(interval);
  }, [matchId, deadline]);


  const sendMove = (index: number) => {
      // Optimitic local checks
      if (winner !== null || board[index] !== null || currentTurn !== myMark) return;

      if (nakamaSocket) {
          const payload = new TextEncoder().encode(JSON.stringify({ position: index }));
          nakamaSocket.sendMatchState(matchId, OpCode.MOVE, payload);
      }
  };

  const getCellLabel = (mark: Mark | null) => {
      if (mark === Mark.X) return 'X';
      if (mark === Mark.O) return 'O';
      return '';
  };

  const getCellClass = (mark: Mark | null) => {
      if (mark === Mark.X) return 'text-blue-400';
      if (mark === Mark.O) return 'text-red-400';
      return '';
  };

  const isMyTurn = currentTurn === myMark;

  return (
    <div className="w-full max-w-md flex flex-col items-center">
       <div className="w-full flex justify-between items-center mb-6 px-2">
           <button onClick={() => setMatchId(null)} className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer">
              <ArrowLeft size={16}/> Leave
           </button>
           <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-full glass-panel ${isMyTurn ? 'text-green-400' : 'text-slate-400'}`}>
               <Clock size={16}/> {deadline ? timeRemaining : '--'}s
           </div>
       </div>

       <div className="text-center mb-6 h-20">
           {winner === Mark.UNDEFINED ? (
              <h2 className="text-2xl font-bold text-yellow-500 mt-2">Match Drawn!</h2>
           ) : winner !== null ? (
              <h2 className="text-3xl font-extrabold text-green-400 mt-2">
                  {winner === myMark ? 'You Won!' : `${opponentName} Won!`}
              </h2>
           ) : (
              <>
                 <h2 className="text-2xl font-semibold">
                     {isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
                 </h2>
                 <p className="text-slate-400 mt-1">You are playing as <strong className="text-white">{myMark === Mark.X ? 'X' : myMark === Mark.O ? 'O' : 'Waiting...'}</strong></p>
              </>
           )}
       </div>

       <div className="glass-panel p-6 rounded-2xl w-full">
          <div className="grid grid-cols-3 gap-3 w-full aspect-square">
             {board.map((cell, i) => (
                <button
                   key={i}
                   onClick={() => sendMove(i)}
                   disabled={cell !== null || !isMyTurn || winner !== null}
                   className={`h-full w-full rounded-xl bg-slate-800/80 hover:bg-slate-700/80 transition text-5xl font-black ${getCellClass(cell)} ${!isMyTurn && cell === null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} shadow-inner`}
                >
                   {getCellLabel(cell)}
                </button>
             ))}
          </div>
       </div>

       {winner !== null && (
          <button 
             onClick={() => setMatchId(null)}
             className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold cursor-pointer transition shadow-lg"
          >
             Return to Lobby
          </button>
       )}
    </div>
  )
}
