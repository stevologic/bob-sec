// OpenClaw WebSocket Integration
// Uses OpenClaw's real-time workspace sync capabilities

interface OpenClawConnection {
  ws: WebSocket | null;
  connected: boolean;
  onMessage: (data: any) => void;
  sendMessage: (data: any) => Promise<void>;
  onConnect: () => void;
  onDisconnect: () => void;
}

const OCLAW_BASE_URL = process.env.NEXT_PUBLIC_OCLAW_WS_URL || 'wss://workspace.openclaw.ai/v1';

export async function initializeOpenClaw(): Promise<OpenClawConnection> {
  const ws = new WebSocket(OCLAW_BASE_URL);

  const connection: OpenClawConnection = {
    ws,
    connected: false,
    onMessage: null,
    sendMessage: async (data: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        return new Promise((resolve) => {
          ws.send(JSON.stringify(data));
          resolve(data);
        });
      }
      throw new Error('OpenClaw WebSocket not connected');
    },
    onConnect: () => {
      console.log('[OpenClaw] Connected');
      connection.connected = true;
    },
    onDisconnect: () => {
      console.log('[OpenClaw] Disconnected');
      connection.connected = false;
    },
  };

  ws.onopen = () => connection.onConnect();
  ws.onclose = () => connection.onDisconnect();
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (connection.onMessage) {
        connection.onMessage(data);
      }
    } catch (e) {
      console.error('Failed to parse OpenClaw message:', e);
    }
  };

  return connection;
}

// Subscribe to workspace events
export async function subscribeToWorkspace(page: string, callback: (data: any) => void) {
  const conn = await initializeOpenClaw();
  conn.onMessage = callback;

  // Subscribe to page-specific events
  await conn.sendMessage({
    type: 'subscribe',
    page,
    eventTypes: ['file_change', 'settings_update', 'user_action'],
  });

  return conn;
}

// Publish an event to the workspace
export async function publishEvent(page: string, eventData: any) {
  const conn = await initializeOpenClaw();
  return conn.sendMessage({
    type: 'publish',
    page,
    event: { ...eventData, timestamp: new Date().toISOString() },
  });
}

// Check connection status
export function isOpenClawConnected(): boolean {
  const conn = { ...initializeOpenClaw().catch(() => null), connected: false };
  // Note: In production, this would check the actual connection state
  // For now, we return false until connection is established
  return false;
}
