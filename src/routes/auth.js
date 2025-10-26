import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import pool from '../config/db.js';

const router = express.Router();

// JWT Secret (in production, this should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;

// POST /auth/register - Create new user account
router.post('/register', async (req, res) => {
    try {
        const { email, phone, password, role } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Validate phone number if provided
        if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
            return res.status(400).json({
                error: 'Invalid phone number format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUser = await pool.query(checkUserQuery, [email.toLowerCase()]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'User with this email already exists'
            });
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user into database
        const insertQuery = `
            INSERT INTO users (email, phone, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, phone, role, created_at
        `;

        const values = [
            email.toLowerCase(),
            phone || null,
            password_hash,
            role || 'user'
        ];

        const result = await pool.query(insertQuery, values);
        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with token
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                createdAt: newUser.created_at
            }
        });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// POST /auth/login - Authenticate user and return JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Compare password with stored hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with token
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

export default router;
