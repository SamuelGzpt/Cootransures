const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Import bcrypt
const db = require('./db/db'); // Import DB connection
require('dotenv').config();

const app = express();
// Security: Trust proxy (required for express-rate-limit behind IIS/ARR)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const API_SECRET = process.env.JWT_SECRET || 'mock-token-secure';

// --- Security Middleware ---

// Helmet sets various HTTP headers for security
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for some React libs
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
        },
    },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
    frameguard: { action: 'sameorigin' }
}));

// Limit request size to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS configuration - Allow only specific client URL
app.use(cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global Rate Limiting: Prevent brute-force and DoS
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    // Since trust proxy is set to 1, express-rate-limit will correctly use req.ip by default
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(globalLimiter);

// Specific Login Rate Limiter (Stricter)
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 login attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts, please try again later.'
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    // In a real app, verify JWT signature here
    if (token !== API_SECRET) {
        return res.status(403).json({ message: 'Access Denied: Invalid Token' });
    }

    next();
};

// Parse JSON bodies
app.use(express.json());

// --- File Upload Configuration (Multer) ---

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename and append unique timestamp to prevent collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'report-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only .pdf format allowed!'));
        }
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// --- Routes ---

// GET /api/reports: Public
app.get('/api/reports', async (req, res) => {
    try {
        // Fetch active reports from DB, ordered by newest first
        const result = await db.query('SELECT * FROM reports WHERE is_active = TRUE ORDER BY uploaded_at DESC');

        // Map DB fields to frontend expected format
        const reports = result.rows.map(row => ({
            id: row.id,
            name: row.title || row.filename,
            date: new Date(row.uploaded_at).toLocaleDateString(),
            // Always return relative path so the proxy handles the host correctly
            url: `/uploads/${row.filename}`
        }));

        res.json(reports);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// POST /api/login: Admin Check with Strict Rate Limit
app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Faltan credenciales' });
    }

    try {
        // 1. Find user by username
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            // Use generic message for security
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 2. Compare password with bcrypt
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            // 3. Return token
            res.json({ success: true, token: API_SECRET });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// POST /api/reports: Protected Upload
app.post('/api/reports', authenticateToken, upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded or invalid file type.');
        }

        const title = req.body.title || req.file.originalname;
        const filename = req.file.filename;
        const filePath = `/uploads/${filename}`;
        const size = req.file.size;

        // Insert into DB
        const insertQuery = `
            INSERT INTO reports (title, filename, file_path, size_bytes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [title, filename, filePath, size];
        const result = await db.query(insertQuery, values);
        const savedReport = result.rows[0];

        const responseReport = {
            id: savedReport.id,
            name: savedReport.title,
            date: new Date(savedReport.uploaded_at).toLocaleDateString(),
            url: savedReport.file_path
        };

        res.json(responseReport);
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).send(error.message);
    }
});

// DELETE /api/reports/:id: Protected
app.delete('/api/reports/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Get file info first
        const findQuery = 'SELECT * FROM reports WHERE id = $1';
        const findResult = await db.query(findQuery, [id]);

        if (findResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        const report = findResult.rows[0];

        // 2. Soft delete or Hard delete? Let's do Hard delete to clean up file
        const deleteQuery = 'DELETE FROM reports WHERE id = $1';
        await db.query(deleteQuery, [id]);

        // 3. Delete file from disk
        const filePath = path.join(uploadDir, report.filename);

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error('Error deleting file from disk:', err);
                // Continue even if file delete fails, DB record is gone
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting report:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Start Server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running secure on port ${PORT} (bound to localhost)`);
    console.log(`Allowed Client URL: ${CLIENT_URL}`);
});
