import { useEffect, useState } from 'react';
import { authenticateDevice, restoreSession, connectSocket, nakamaSocket } from './NakamaClient';
import Lobby from './Lobby';
import Game from './Game';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    // Generate a fresh device ID so every login is guaranteed a completely brand-new Nakama Account for testing
    const deviceId = crypto.randomUUID();
    localStorage.setItem('nk_device_id', deviceId);
    
    const session = await authenticateDevice(deviceId, usernameInput.trim());
    await connectSocket(session);
    setAuthenticated(true);
  };

  useEffect(() => {
    let session = restoreSession();
    if (session) {
      connectSocket(session).then(() => setAuthenticated(true));
    }

    return () => {
      if (nakamaSocket) nakamaSocket.disconnect(false);
    }
  }, []);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8 rounded-2xl w-full max-w-sm">
           <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-center mb-6">
             Tic-Tac-Toe
           </h1>
           <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Enter Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={12}
                className="p-3 rounded-lg bg-slate-800 border border-slate-600 focus:outline-none focus:border-cyan-400 text-white"
              />
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold transition hover:opacity-90">
                 Join Game
              </button>
           </form>
           <p className="text-xs text-slate-500 mt-4 text-center">
              (To play against yourself, open an Incognito Window!)
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      <header className="mb-8 mt-4 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Global Tic-Tac-Toe
        </h1>
        <p className="text-slate-400 text-sm mt-2">Server-Authoritative Matchmaking</p>
      </header>
      
      {matchId ? (
        <Game matchId={matchId} setMatchId={setMatchId} />
      ) : (
        <Lobby setMatchId={setMatchId} />
      )}
    </div>
  );
}
