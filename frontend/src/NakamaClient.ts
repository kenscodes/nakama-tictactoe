import { Client, Session } from '@heroiclabs/nakama-js';
import type { Socket } from '@heroiclabs/nakama-js';

// Configuration. Overwrite `host` with your assigned VPS or Render deployment.
const useSSL = false; 
const host = '127.0.0.1'; 
const port = '7350';
const serverKey = 'defaultkey';

export const nakamaClient = new Client(serverKey, host, port, useSSL);
export let nakamaSession: Session | null = null;
export let nakamaSocket: Socket | null = null;

export const authenticateDevice = async (deviceId: string, username?: string) => {
    nakamaSession = await nakamaClient.authenticateDevice(deviceId, true, username);
    if (username) {
        try {
            await nakamaClient.updateAccount(nakamaSession, { username: username });
        } catch(e) {}
    }
    localStorage.setItem('nk_session_token', nakamaSession.token);
    return nakamaSession;
};

export const restoreSession = () => {
    const token = localStorage.getItem('nk_session_token');
    if (token) {
        nakamaSession = Session.restore(token, '');
        if (nakamaSession.isexpired(Date.now() / 1000)) {
            nakamaSession = null;
            localStorage.removeItem('nk_session_token');
        }
    }
    return nakamaSession;
};

export const connectSocket = async (session: Session) => {
    nakamaSocket = nakamaClient.createSocket(useSSL, false);
    await nakamaSocket.connect(session, true);
    return nakamaSocket;
};
