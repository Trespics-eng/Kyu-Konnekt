/**
 * KyUConnect Real-time Socket Client
 *
 * Connects to the backend Socket.IO server and handles live events:
 * - `post:created` — a new AI-discovered news post is live
 *
 * Uses a lazy dynamic import so socket.io-client is never loaded at module
 * initialisation time. This prevents any module-level side effects that could
 * interfere with React's hook dispatcher before the React root is mounted.
 */

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1')
  .replace('/api/v1', '')
  .replace(/\/$/, '');

export type PostCreatedPayload = {
  id: string;
  author: Record<string, unknown>;
  category: string;
  type: string;
  body: string;
  image?: string | null;
  mediaType?: string | null;
  likes: number;
  commentsCount: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  created_at?: string;
};

type PostCreatedCallback = (post: PostCreatedPayload) => void;

class KyUSocketClient {
  // Using `any` avoids the dynamic `ReturnType<typeof import(...)>` which some
  // bundlers evaluate at module-parse time (before React is ready).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private socket: any = null;
  private postCreatedListeners: PostCreatedCallback[] = [];
  private connected = false;
  private connectCalled = false;

  connect(token?: string | null) {
    // Guard: only connect once
    if (this.connectCalled) return;
    this.connectCalled = true;

    // Lazy import — socket.io-client is loaded only after React mounts
    import('socket.io-client')
      .then(({ io }) => {
        this.socket = io(SOCKET_URL, {
          auth: token ? { token } : {},
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 8000,
        });

        this.socket.on('connect', () => {
          this.connected = true;
          console.log('[KyUSocket] Connected to backend real-time server');
        });

        this.socket.on('disconnect', () => {
          this.connected = false;
          console.log('[KyUSocket] Disconnected');
        });

        this.socket.on('connect_error', (err: Error) => {
          // Non-fatal — app works fine without real-time
          console.debug('[KyUSocket] Connection error (real-time unavailable):', err.message);
        });

        // Listen for AI-published news posts
        this.socket.on('post:created', (payload: PostCreatedPayload) => {
          console.log('[KyUSocket] AI news post received:', payload?.category, payload?.id);
          for (const cb of this.postCreatedListeners) {
            try {
              cb(payload);
            } catch {
              /* ignore individual listener errors */
            }
          }
        });
      })
      .catch(() => {
        // socket.io-client unavailable — graceful degradation
        console.debug('[KyUSocket] socket.io-client could not be loaded; real-time disabled.');
      });
  }

  /** Register a callback for new AI-published posts. Returns an unsubscribe fn. */
  onPostCreated(cb: PostCreatedCallback): () => void {
    this.postCreatedListeners.push(cb);
    return () => {
      this.postCreatedListeners = this.postCreatedListeners.filter((f) => f !== cb);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.connectCalled = false;
  }

  isConnected() {
    return this.connected;
  }
}

// Module-level singleton — created lazily, no React imports, no hooks
export const kyuSocket = new KyUSocketClient();
