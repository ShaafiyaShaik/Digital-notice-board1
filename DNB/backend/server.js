require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  registrationNumber: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'faculty', 'librarian', 'admin'] },
});

const User = mongoose.model('User', userSchema);

// Notice Schema
const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['general', 'academic', 'events'] },
  date: { type: String, required: true },
  urgent: { type: Boolean, default: false },
}, { timestamps: true }); // Added timestamps

const Notice = mongoose.model('Notice', noticeSchema);

// Middleware to verify JWT
const authMiddleware = (roles) => (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (roles && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Routes

// User Registration
app.post('/register', async (req, res) => {
  const { registrationNumber, name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ registrationNumber, name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, registrationNumber, password, role } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email }, { registrationNumber }] });
    if (!user) return res.status(400).json({ message: 'User not found.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password.' });

    if (user.role !== role) return res.status(400).json({ message: 'Role mismatch.' });

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role }, redirectTo: role === 'admin' ? '/admin' : '/' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Notice CRUD Operations

// Create Notice
app.post('/notices', authMiddleware(['admin']), async (req, res) => {
  const { title, description, category, date, urgent } = req.body;

  try {
    const notice = new Notice({ 
      title, 
      description, 
      category, 
      date, 
      urgent: urgent || false 
    });
    await notice.save();
    res.status(200).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ _id: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Notice
app.put('/notices/:id', authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const { title, description, category, date, urgent, file } = req.body;

  try {
    const notice = await Notice.findByIdAndUpdate(
      id, 
      { title, description, category, date, urgent, file }, 
      { new: true }
    );
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Notice
app.delete('/notices/:id', authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    await Notice.findByIdAndDelete(id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));