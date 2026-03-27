require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'chrystelclear-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === PUBLIC SITE ===
// Serve the public website (no login required)
app.use(express.static(path.join(__dirname, 'public')));

// === DASHBOARD AUTH ===
const DASH_USER = process.env.DASH_USER || 'crystel';
const DASH_PASS = process.env.DASH_PASS || 'herbecoming2026';

// Login page
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/dashboard');
  }
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Chrystel Clear — Dashboard Login</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#FDFBF8;min-height:100vh;display:flex;align-items:center;justify-content:center}
.login-card{background:#fff;border-radius:24px;padding:48px;max-width:400px;width:90%;border:1px solid rgba(232,221,211,.5);box-shadow:0 20px 60px rgba(61,46,31,.06)}
.brand{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:500;color:#3D2E1F;text-align:center;margin-bottom:8px}
.brand em{font-style:italic;font-weight:400}
.subtitle{font-size:13px;color:#A69889;text-align:center;margin-bottom:32px}
label{font-size:13px;font-weight:600;color:#3D2E1F;display:block;margin-bottom:6px}
input{width:100%;padding:12px 16px;border:1.5px solid #E8DDD3;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:14px;margin-bottom:20px;outline:none;transition:border-color .3s}
input:focus{border-color:#C4775B}
button{width:100%;padding:14px;background:#3D2E1F;color:#FDFBF8;border:none;border-radius:100px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .3s}
button:hover{background:#C4775B}
.error{background:rgba(196,119,91,.1);color:#C4775B;padding:10px 16px;border-radius:10px;font-size:13px;margin-bottom:20px;display:${req.query.error ? 'block' : 'none'}}
</style>
</head>
<body>
<div class="login-card">
<div class="brand">Chrystel <em>Clear</em></div>
<div class="subtitle">Dashboard Login</div>
<div class="error">Invalid username or password</div>
<form method="POST" action="/login">
<label>Username</label>
<input type="text" name="username" placeholder="Enter username" required autofocus>
<label>Password</label>
<input type="password" name="password" placeholder="Enter password" required>
<button type="submit">Sign In</button>
</form>
</div>
</body>
</html>`);
});

// Login handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === DASH_USER && password === DASH_PASS) {
    req.session.authenticated = true;
    return res.redirect('/dashboard');
  }
  res.redirect('/login?error=1');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Dashboard auth middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.redirect('/login');
}

// === DASHBOARD ROUTES ===
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'dashboard.html'));
});
app.get('/dashboard/content', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'content.html'));
});
app.get('/dashboard/funnel', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'funnel.html'));
});
app.get('/dashboard/performance', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'performance.html'));
});
app.get('/dashboard/clients', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'clients.html'));
});
app.get('/dashboard/research', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'research.html'));
});
app.get('/dashboard/analytics', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'analytics.html'));
});

// Serve dashboard static assets (CSS, JS, images) behind auth
app.use('/dashboard/assets', requireAuth, express.static(path.join(__dirname, 'dashboard', 'assets')));

// === API ROUTES ===

// AI Script Generation
app.post('/api/generate-script', requireAuth, async (req, res) => {
  const { idea, pillar, platform } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Missing required field: idea' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Write an Instagram script for Crystel's 'her,becoming' program about: ${idea}. Content pillar: ${pillar || 'General'}. Platform: ${platform || 'Instagram'}. Keep it conversational, authentic, and under 150 words. Include a hook, main point, and CTA.`
        }
      ]
    });

    const script = message.content[0].text;
    res.json({ script });
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

// Health check (Railway uses this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all: serve index.html for unknown routes (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log('');
  console.log('  ✦ Chrystel Clear — Server Running');
  console.log(`  → Public site:  http://localhost:${PORT}`);
  console.log(`  → Dashboard:    http://localhost:${PORT}/dashboard`);
  console.log(`  → Login:        http://localhost:${PORT}/login`);
  console.log('');
});
