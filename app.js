const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware 
const cors = require("cors");
app.use(cors({
  origin: "*", // ya specific frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json()); 

// MongoDB Connection
mongoose.connect(process.env.MONGO_DB_URL || 'mongodb://localhost:27017/counterapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
}); 

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Counter Schema
const counterSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true,
        default: 0 
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Counter = mongoose.model('Counter', counterSchema);

// Routes

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Counter App Backend Running!' });
}); 

// Save counter value
app.post('/api/counter/save', async (req, res) => {
    try {
        const { value } = req.body;
        
        if (typeof value !== 'number') {
            return res.status(400).json({ 
                success: false, 
                message: 'Counter value must be a number' 
            }); 
        } 

        const counter = new Counter({ value });
        await counter.save();

        res.status(201).json({
            success: true,
            message: 'Counter value saved successfully',
            data: {
                id: counter._id,
                value: counter.value,
                timestamp: counter.timestamp
            }
        });
    } catch (error) {
        console.error('Error saving counter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save counter value'
        });
    }
});

// Get latest counter value (optional - for future use)
app.get('/api/counter/latest', async (req, res) => {
    try {
        const latestCounter = await Counter.findOne().sort({ timestamp: -1 });
        
        if (!latestCounter) {
            return res.json({
                success: true,
                data: { value: 0 }
            });
        }

        res.json({
            success: true,
            data: {
                id: latestCounter._id,
                value: latestCounter.value,
                timestamp: latestCounter.timestamp
            }
        });
    } catch (error) {
        console.error('Error fetching counter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch counter value'
        });
    }
});

// Get all counter history (optional - for future use)
app.get('/api/counter/history', async (req, res) => {
    try {
        const counters = await Counter.find().sort({ timestamp: -1 }).limit(10);
        
        res.json({
            success: true,
            data: counters
        });
    } catch (error) {
        console.error('Error fetching counter history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch counter history'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;