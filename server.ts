import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_URL = (process.env.BASE_URL || 'https://welcome-capital-jaybird.ngrok-free.app').replace(/\/+$/, '');

app.use(express.json());
app.use(cookieParser());

// Helper to decode JWT payload without external library
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse JWT payload', err);
    return null;
  }
}

function extractToken(req: Request): string | null {
  if (req.cookies && req.cookies.lark_token) {
    return req.cookies.lark_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customHeader = req.headers['x-lark-token'];
  if (typeof customHeader === 'string' && customHeader) {
    return customHeader;
  }
  return null;
}

function resolveRole(groups: string[] = []): 'GLOBAL_ADMIN' | 'GLOBAL_READER' | 'DEMO_USERS' | 'USER' {
  if (groups.includes('GLOBAL_ADMIN')) return 'GLOBAL_ADMIN';
  if (groups.includes('GLOBAL_READER')) return 'GLOBAL_READER';
  if (groups.includes('DEMO_USERS')) return 'DEMO_USERS';
  return 'USER';
}

// 1. Login endpoint
app.post('/api/directory/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ detail: 'Username and password are required' });
    }

    const upstreamRes = await fetch(`${BASE_URL}/directory/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await upstreamRes.json().catch(() => ({}));

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json(data);
    }

    // Extract cookie from Set-Cookie header
    const rawSetCookie = upstreamRes.headers.get('set-cookie') || '';
    let token = '';
    const tokenMatch = rawSetCookie.match(/access_token=([^;]+)/);
    if (tokenMatch) {
      token = tokenMatch[1];
    }

    let userProfile = null;
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        const groups = Array.isArray(payload.groups) ? payload.groups : [];
        userProfile = {
          username: payload.sub || username,
          name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || username,
          givenName: payload.given_name || '',
          familyName: payload.family_name || '',
          email: payload.email || '',
          department: payload.department || '',
          title: payload.title || '',
          groups,
          role: resolveRole(groups),
          exp: payload.exp,
        };
      }

      // Set cookie on our app's origin
      res.cookie('lark_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });
    }

    return res.status(200).json({
      success: true,
      message: data.message || 'Authentication successful',
      token,
      user: userProfile,
    });
  } catch (err: any) {
    console.error('Error during login proxy:', err);
    return res.status(500).json({ detail: err.message || 'Internal server error during login' });
  }
});

// 2. Current User / Session Check
app.get('/api/me', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.json({ authenticated: false });
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return res.json({ authenticated: false });
  }

  // Check expiration
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    res.clearCookie('lark_token');
    return res.json({ authenticated: false, reason: 'Token expired' });
  }

  const groups = Array.isArray(payload.groups) ? payload.groups : [];
  const user = {
    username: payload.sub || '',
    name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || payload.sub,
    givenName: payload.given_name || '',
    familyName: payload.family_name || '',
    email: payload.email || '',
    department: payload.department || '',
    title: payload.title || '',
    groups,
    role: resolveRole(groups),
    exp: payload.exp,
  };

  return res.json({ authenticated: true, user, token });
});

// 3. Logout endpoint
app.post('/api/directory/logout', async (req: Request, res: Response) => {
  const token = extractToken(req);
  try {
    if (token) {
      await fetch(`${BASE_URL}/directory/logout`, {
        method: 'POST',
        headers: {
          Cookie: `access_token=${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      }).catch(() => {});
    }
  } catch (e) {
    // ignore
  }

  res.clearCookie('lark_token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 4. Proxy all other /api/directory/* routes
app.all('/api/directory/*', async (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ detail: 'Authentication required. Please sign in.' });
  }

  // Target path: e.g. /directory/users -> /directory/users
  const targetPath = req.originalUrl.replace(/^\/api/, '');
  const url = `${BASE_URL}${targetPath}`;

  try {
    const headers: Record<string, string> = {
      Cookie: `access_token=${token}`,
      'ngrok-skip-browser-warning': 'true',
    };

    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body && Object.keys(req.body).length > 0;
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    const upstreamRes = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await upstreamRes.json();
      return res.status(upstreamRes.status).json(data);
    } else {
      const text = await upstreamRes.text();
      return res.status(upstreamRes.status).send(text);
    }
  } catch (err: any) {
    console.error(`Upstream error for ${req.method} ${targetPath}:`, err);
    return res.status(502).json({ detail: `Failed to communicate with LDAP backend: ${err.message}` });
  }
});

// 5. Config info endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    baseUrl: BASE_URL,
    appName: 'LARK',
    version: '1.0.0',
  });
});

// 6. Vite middleware (dev) or static serving (prod)
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LARK server listening on port ${PORT} (proxying to ${BASE_URL})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
