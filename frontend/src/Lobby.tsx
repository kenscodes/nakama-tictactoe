import { useState, useEffect } from 'react';
import { nakamaSocket, nakamaSession, nakamaClient } from './NakamaClient';
import { Search, Trophy, LogOut } from 'lucide-react';

export default function Lobby({ setMatchId }: { setMatchId: (id: string | null) => void }) {
  const [findingMatch, setFindingMatch] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if(nakamaSession) {
          const res = await nakamaClient.listLeaderboardRecords(nakamaSession, 'tictactoe_wins', [], 100);
          setLeaderboard(res.records || []);
        }
      } catch (e) {
        console.error("No generic leaderboard found yet.");
      }
    };
    
    fetchLeaderboard();
    const lbInterval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(lbInterval);
  }, [setMatchId]);

  const findMatch = async () => {
     if (!nakamaSession || !nakamaSocket) return;
     setFindingMatch(true);

     try {
         // Use the backend RPC function via WebSocket to either join an open match or create a new one
         const rpcRes = await nakamaSocket.rpc('find_match_js', JSON.stringify({ fast: false }));
         if (rpcRes.payload) {
             const data = JSON.parse(rpcRes.payload);
             if (data.matchIds && data.matchIds.length > 0) {
                 const matchId = data.matchIds[0];
                 const joinRes = await nakamaSocket.joinMatch(matchId);
                 setMatchId(joinRes.match_id);
             }
         }
     } catch (e) {
         console.error("RPC Match error", e);
     } finally {
         setFindingMatch(false);
     }
  };

  const handleSignOut = () => {
      localStorage.removeItem('nk_session_token');
      localStorage.removeItem('nk_device_id');
      window.location.reload();
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="w-full flex justify-end">
          <button onClick={handleSignOut} className="text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition">
             <LogOut size={16}/> Switch Account
          </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center">
        <button 
          onClick={findMatch}
          disabled={findingMatch}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          {findingMatch ? 'Searching for opponent...' : <><Search size={20}/> Find Match</>}
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" />
          Global Leaderboard
        </h2>
        
        {leaderboard.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No wins recorded globally yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {leaderboard.map((record, i) => (
              <div key={record.owner_id} className="flex justify-between items-center p-4 bg-slate-800/60 rounded-xl border border-white/10 shadow-sm transition hover:bg-slate-700/60">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center bg-slate-900 w-8 h-8 rounded-full font-bold text-slate-400">
                      {i+1}
                    </div>
                    <span className="font-bold text-slate-100 text-lg">
                        {record.username}
                        {record.owner_id === nakamaSession?.user_id && <span className="ml-2 text-xs bg-indigo-500/30 text-indigo-300 px-2 py-1 rounded-md">YOU</span>}
                    </span>
                 </div>
                 <span className="text-cyan-400 font-black text-xl">{record.score} <span className="text-sm text-cyan-500/70 font-semibold">WINS</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
