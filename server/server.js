require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // For calling PHP AI service
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Handle deployment subpath
const BASE_PATH = process.env.API_BASE_PATH || '';
const router = express.Router();

// Registration Endpoint
router.post('/api/auth/register', (req, res) => {
    const { username, email, password, full_name, phone_number, role } = req.body;
    const nameToUse = full_name || username || email.split('@')[0];

    const query = `INSERT INTO users (username, email, password, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [nameToUse, email, password, nameToUse, phone_number || '', role || 'patient'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            console.error('Registration error:', err);
            // Fallback to mock if table doesn't exist yet
            const userData = { id: Date.now(), username: nameToUse, email, full_name: nameToUse, role: role || 'patient' };
            const token = jwt.sign(userData, process.env.JWT_SECRET || 'your_secret_key');
            return res.json({ success: true, data: { ...userData, api_token: token } });
        }

        const userData = { id: result.insertId, username: nameToUse, email, full_name: nameToUse, role: role || 'patient' };
        const token = jwt.sign(userData, process.env.JWT_SECRET || 'your_secret_key');
        res.json({ success: true, data: { ...userData, api_token: token } });
    });
});

// Login Endpoint
router.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            // Fallback
            const username = email ? email.split('@')[0] : 'Demo User';
            const userData = { id: 1, username, full_name: username, email, role: 'patient' };
            const token = jwt.sign(userData, process.env.JWT_SECRET || 'your_secret_key');
            return res.json({ success: true, data: { ...userData, api_token: token } });
        }

        if (results.length > 0) {
            const user = results[0];
            const userData = {
                id: user.id,
                username: user.username,
                full_name: user.full_name || user.username,
                email: user.email,
                role: user.role
            };
            const token = jwt.sign(userData, process.env.JWT_SECRET || 'your_secret_key');
            res.json({ success: true, data: { ...userData, api_token: token } });
        } else {
            // Check if email exists to give better error
            db.query(`SELECT * FROM users WHERE email = ?`, [email], (err2, res2) => {
                if (!err2 && res2.length > 0) {
                    res.status(401).json({ success: false, message: 'Invalid password' });
                } else {
                    res.status(401).json({ success: false, message: 'User not found' });
                }
            });
        }
    });
});

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'visual_motor_db'
});

db.connect((err) => {
    if (err) {
        console.warn('MySQL Connection Error (chatbot will still work):', err.message);
        return;
    }
    console.log('Connected to MySQL Database');

    // Create Tables if not exists
    const createMoodTable = `
        CREATE TABLE IF NOT EXISTS mood_analysis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            mood VARCHAR(50),
            stress_level INT,
            answers_json JSON,
            reaction_time INT,
            final_score INT,
            mood_status VARCHAR(50),
            recommended_exercise VARCHAR(50),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createMoodTable, (err) => { if (err) console.warn('Table creation failed:', err.message); });

    const createSessionsTable = `
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255),
            exercise_id VARCHAR(50),
            title VARCHAR(255),
            score INT,
            accuracy INT,
            duration_minutes INT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createSessionsTable, (err) => { if (err) console.warn('Table creation failed:', err.message); });

    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            full_name VARCHAR(255),
            phone_number VARCHAR(50),
            role VARCHAR(50) DEFAULT 'patient',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createUsersTable, (err) => { if (err) console.warn('Users table creation failed:', err.message); });
});

// GET Endpoint: Fetch exercise sessions for a user
router.get('/api/user-sessions/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM user_sessions WHERE user_id = ? ORDER BY timestamp DESC';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching sessions:', err);
            return res.status(500).json({ error: 'Database fetch failed' });
        }
        res.json(results);
    });
});

// POST Endpoint: Save a new exercise session
router.post('/api/user-sessions', (req, res) => {
    const { user_id, exerciseId, title, score, accuracy, durationMinutes } = req.body;

    const query = `
        INSERT INTO user_sessions 
        (user_id, exercise_id, title, score, accuracy, duration_minutes) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [user_id, exerciseId, title, score, accuracy, durationMinutes], (err, result) => {
        if (err) {
            console.error('Error saving session:', err);
            return res.status(500).json({ error: 'Database saving failed' });
        }
        res.json({ success: true, sessionId: result.insertId });
    });
});

// PUT Endpoint: Update user profile
router.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { full_name, phone_number } = req.body;

    const query = `UPDATE users SET full_name = ?, phone_number = ? WHERE id = ?`;
    db.query(query, [full_name, phone_number, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Database update failed' });
        }

        // Fetch updated user to return
        db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
            if (err || results.length === 0) {
                return res.json({ success: true });
            }
            const user = results[0];
            const userData = {
                id: user.id,
                username: user.username,
                full_name: user.full_name || user.username,
                email: user.email,
                role: user.role,
                phone_number: user.phone_number
            };
            res.json({ success: true, data: userData });
        });
    });
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Endpoint: POST /api/mood-analysis
router.post('/api/mood-analysis', authenticateToken, async (req, res) => {
    const { user_id, mood, stress_level, questionnaire_answers, reaction_time } = req.body;

    try {
        // 1. Send data to Python AI service
        let aiResult = {
            mood_status: 'Moderate Stress',
            recommended_exercise: '01',
            message: 'Analysis indicates stable sympathetic activity.'
        };

        try {
            const aiResponse = await axios.post(process.env.AI_SERVICE_URL || 'http://localhost/visualmotortrainer/server/ai_processor.php', {
                action: 'analyze',
                mood,
                stress_level,
                reaction_time
            });
            aiResult = aiResponse.data;
        } catch (e) {
            console.warn('AI service not reachable, using heuristic analysis.');
            // Heuristic fallback
            if (stress_level > 7) {
                aiResult = { mood_status: 'High Stress', recommended_exercise: '01', message: 'Hyper-arousal detected.' };
            } else if (stress_level > 4) {
                aiResult = { mood_status: 'Moderate Stress', recommended_exercise: '02', message: 'Baseline stabilization recommended.' };
            } else {
                aiResult = { mood_status: 'Stable', recommended_exercise: '03', message: 'Optimal neural homeostasis.' };
            }
        }

        // 2. Save data to MySQL
        const insertQuery = `
            INSERT INTO mood_analysis 
            (user_id, mood, stress_level, answers_json, reaction_time, mood_status, recommended_exercise) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [
            user_id,
            mood,
            stress_level,
            questionnaire_answers,
            reaction_time,
            aiResult.mood_status,
            aiResult.recommended_exercise
        ], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database saving failed' });
            }

            // 3. Return JSON response
            res.json({
                mood_status: aiResult.mood_status,
                stress_category: stress_level > 5 ? 'Elevated' : 'Normal',
                recommended_exercise: aiResult.recommended_exercise,
                message: aiResult.message
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Post-processing failed' });
    }
});

// Mount router on app
app.use(BASE_PATH, router);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
