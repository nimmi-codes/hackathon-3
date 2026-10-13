require('dotenv').config();
// Node's default resolver can fail SRV lookups (mongodb+srv) on some networks; use public DNS.
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS is open to any origin (hardcoded, no env var). Auth uses a Bearer token in the
// Authorization header, not cookies, so this does not expose user sessions.
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, service: 'Boarding House Finder API' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boardings', require('./routes/boardings'));
app.use('/api/reports', require('./routes/reports'));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Hardcoded admin account, created/reset on every start
const ADMIN_EMAIL = 'nimna@gmail.com';
const ADMIN_PASS = 'Nimna123#';
async function ensureAdmin() {
  const User = require('./models/User');
  const password = await require('bcryptjs').hash(ADMIN_PASS, 10);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { $set: { password, role: 'admin' }, $setOnInsert: { name: 'Nimna' } },
    { upsert: true }
  );
  console.log('Admin account ready:', ADMIN_EMAIL);
}

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await ensureAdmin();
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
