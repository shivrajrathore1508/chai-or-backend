const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/item');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const protect = require('./middleware/auth');

const cookieParser = require('cookie-parser'); // Import cookie-parser


// Load environment variables
dotenv.config();

const app = express();


// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();



// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser()); // Use cookie-parser


// Public routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/hs', protect, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hs.html'));
});


app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});



app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

app.get('/admin', protect,(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


app.use(cors({
    exposedHeaders: ['Authorization']
}));

app.post('/logout', (req, res) => {
    // Clear the authToken cookie
    res.clearCookie('authToken', {
        httpOnly: true,  // Ensures the cookie can only be accessed by the server
        secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
        sameSite: 'strict', // Adjust based on your needs
        path: '/', // Path should match the one set when creating the cookie
    });

    // Send a response confirming the user has been logged out
    res.status(200).json({ message: 'Logged out successfully' });
});



// Authentication routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/items', itemRoutes);

// Start server
app.listen(3000, () => {
    console.log(`Server running at http://localhost:3000`);
});

