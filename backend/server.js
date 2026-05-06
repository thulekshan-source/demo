import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const DATABASE_URL = process.env.DATABASE_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

let isMongoConnected = false;

mongoose.connect(DATABASE_URL, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('Connected to MongoDB Atlas'); isMongoConnected = true; })
  .catch(err => { console.error('MongoDB error:', err.message); console.log('Falling back to Local JSON'); });

mongoose.connection.on('disconnected', () => { isMongoConnected = false; });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: 'customer' },
  category: { type: String, default: 'None' },
  googleId: { type: String },
  avatar: { type: String },
  authProvider: { type: String, default: 'local' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

const DB_PATH = path.join(__dirname, 'db');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH);

const readJSON = (filename) => {
  const filePath = path.join(DB_PATH, filename);
  if (!fs.existsSync(filePath)) return [];
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return []; }
};

const writeJSON = (filename, data) => {
  try { fs.writeFileSync(path.join(DB_PATH, filename), JSON.stringify(data, null, 2), 'utf8'); return true; } catch { return false; }
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

const issueToken = (user) => {
  const userId = user._id || user.id;
  const token = jwt.sign({ id: userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  return { token, user: { id: userId, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, authProvider: user.authProvider || 'local' } };
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, category } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

    if (isMongoConnected) {
      if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
      const newUser = new User({ name, email, password: await bcrypt.hash(password, 10), role: role || 'customer', category: category || 'None', authProvider: 'local' });
      await newUser.save();
    } else {
      const users = readJSON('users.json');
      if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
      users.push({ id: Date.now().toString(), name, email, password: await bcrypt.hash(password, 10), role: role || 'customer', category: category || 'None', authProvider: 'local', createdAt: new Date().toISOString() });
      writeJSON('users.json', users);
    }
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error during signup' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;
    if (isMongoConnected) { user = await User.findOne({ email }); }
    else { user = readJSON('users.json').find(u => u.email === email); }
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.password) return res.status(401).json({ message: 'This account uses Google Sign-In. Please use the Google button.' });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json(issueToken(user));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error during login' }); }
});

// Google OAuth endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential missing' });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user;
    if (isMongoConnected) {
      user = await User.findOne({ googleId }) || await User.findOne({ email });
      if (!user) {
        user = new User({ name, email, googleId, avatar: picture, role: 'customer', category: 'None', authProvider: 'google' });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = googleId; user.avatar = picture; user.authProvider = 'google';
        await user.save();
      }
    } else {
      const users = readJSON('users.json');
      user = users.find(u => u.googleId === googleId) || users.find(u => u.email === email);
      if (!user) {
        user = { id: Date.now().toString(), name, email, googleId, avatar: picture, role: 'customer', category: 'None', authProvider: 'google', createdAt: new Date().toISOString() };
        users.push(user);
      } else if (!user.googleId) {
        user.googleId = googleId; user.avatar = picture; user.authProvider = 'google';
      }
      writeJSON('users.json', users);
    }
    res.json(issueToken(user));
  } catch (err) { console.error('Google OAuth error:', err); res.status(401).json({ message: 'Google authentication failed' }); }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    let user;
    if (isMongoConnected) { user = await User.findById(req.user.id).select('-password'); }
    else { const found = readJSON('users.json').find(u => u.id === req.user.id); if (found) { const { password, ...rest } = found; user = rest; } }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch { res.status(500).json({ message: 'Error fetching profile' }); }
});

// --- BOOKING ROUTES ---

// FIX: now requires authentication (was open before)
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const bookingData = { ...req.body, email: req.user.email, userId: req.user.id };
    if (isMongoConnected) {
      await new Booking(bookingData).save();
    } else {
      const bookings = readJSON('bookings.json');
      bookings.push({ ...bookingData, id: Date.now().toString(), createdAt: new Date().toISOString() });
      writeJSON('bookings.json', bookings);
    }
    res.status(201).json({ message: 'Booking received' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error saving booking' }); }
});

app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    let bookings;
    if (isMongoConnected) {
      bookings = req.user.role === 'admin'
        ? await Booking.find().sort({ createdAt: -1 })
        : await Booking.find({ email: req.user.email }).sort({ createdAt: -1 });
    } else {
      const all = readJSON('bookings.json');
      bookings = req.user.role === 'admin'
        ? all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : all.filter(b => b.email === req.user.email).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(bookings);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error fetching bookings' }); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: isMongoConnected ? 'mongodb' : 'json-fallback' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
