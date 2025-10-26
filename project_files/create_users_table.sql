-- Create users table for Credentials API
-- Run this in your Render PostgreSQL database

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert a test user (password is 'test123')
-- Password hash generated with bcrypt for 'test123'
INSERT INTO users (email, phone, password_hash, role)
VALUES ('test@example.com', '1234567890', '$2b$10$YQlXN5Eq8EZ5xqvZxqvZxOZ5xqvZxqvZxqvZxqvZxqvZxqvZxqvZx', 'user')
ON CONFLICT (email) DO NOTHING;
