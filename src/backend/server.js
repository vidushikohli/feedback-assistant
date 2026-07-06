import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 3001;
const jwtSecret = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'password',
  },
  {
    id: 2,
    username: 'coadmin',
    password: 'password',
  },
];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const user = users.find((item) => item.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, {
    expiresIn: '1h',
  });

  return res.status(200).json({ access_token: token });
});

// Coadmin login route (mirrors /auth/login for local dev)
app.post('/coadmin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const user = users.find((item) => item.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, {
    expiresIn: '1h',
  });

  return res.status(200).json({ access_token: token });
});

app.get('/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, jwtSecret);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Auth backend running on http://localhost:${port}`);
});
