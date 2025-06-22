const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// ✅ Validate critical environment variables
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Environment variable ${key} is missing.`);
    process.exit(1); // Stop the server
  }
});


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection - Try different cluster names
const MONGODB_URI = process.env.MONGODB_URI;

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to Database');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

connectToMongoDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Blog Site API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 