-- =====================================================
-- Normalized Database Schema for TV Shows API
-- For Supabase PostgreSQL
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS show_actors CASCADE;
DROP TABLE IF EXISTS show_networks CASCADE;
DROP TABLE IF EXISTS show_genres CASCADE;
DROP TABLE IF EXISTS show_creators CASCADE;
DROP TABLE IF EXISTS show_studios CASCADE;
DROP TABLE IF EXISTS actors CASCADE;
DROP TABLE IF EXISTS networks CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS creators CASCADE;
DROP TABLE IF EXISTS studios CASCADE;
DROP TABLE IF EXISTS tv_shows CASCADE;

-- =====================================================
-- Core Tables
-- =====================================================

-- TV Shows Table (core show information)
CREATE TABLE tv_shows (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT,
    first_air_date DATE,
    last_air_date DATE,
    seasons INTEGER DEFAULT 0,
    episodes INTEGER DEFAULT 0,
    status TEXT,
    overview TEXT,
    popularity NUMERIC(10, 3) DEFAULT 0,
    tmdb_rating NUMERIC(3, 1) DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    poster_url TEXT,
    backdrop_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Actors Table
CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    profile_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Networks Table
CREATE TABLE networks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Genres Table
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creators Table
CREATE TABLE creators (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Studios/Production Companies Table
CREATE TABLE studios (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Junction Tables (Many-to-Many Relationships)
-- =====================================================

-- Show-Actor Junction Table
CREATE TABLE show_actors (
    show_id INTEGER NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    character_name TEXT,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (show_id, actor_id)
);

-- Show-Network Junction Table
CREATE TABLE show_networks (
    show_id INTEGER NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
    network_id INTEGER NOT NULL REFERENCES networks(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, network_id)
);

-- Show-Genre Junction Table
CREATE TABLE show_genres (
    show_id INTEGER NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, genre_id)
);

-- Show-Creator Junction Table
CREATE TABLE show_creators (
    show_id INTEGER NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
    creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, creator_id)
);

-- Show-Studio Junction Table
CREATE TABLE show_studios (
    show_id INTEGER NOT NULL REFERENCES tv_shows(id) ON DELETE CASCADE,
    studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, studio_id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- TV Shows indexes
CREATE INDEX idx_tv_shows_name ON tv_shows(name);
CREATE INDEX idx_tv_shows_first_air_date ON tv_shows(first_air_date);
CREATE INDEX idx_tv_shows_popularity ON tv_shows(popularity DESC);
CREATE INDEX idx_tv_shows_rating ON tv_shows(tmdb_rating DESC);

-- Actor indexes
CREATE INDEX idx_actors_name ON actors(name);

-- Network indexes
CREATE INDEX idx_networks_name ON networks(name);

-- Genre indexes
CREATE INDEX idx_genres_name ON genres(name);

-- Junction table indexes for efficient lookups
CREATE INDEX idx_show_actors_actor_id ON show_actors(actor_id);
CREATE INDEX idx_show_actors_show_id ON show_actors(show_id);
CREATE INDEX idx_show_networks_network_id ON show_networks(network_id);
CREATE INDEX idx_show_genres_genre_id ON show_genres(genre_id);
CREATE INDEX idx_show_creators_creator_id ON show_creators(creator_id);
CREATE INDEX idx_show_studios_studio_id ON show_studios(studio_id);

-- =====================================================
-- Useful Views for Common Queries
-- =====================================================

-- View: Shows with all related data aggregated
CREATE OR REPLACE VIEW shows_complete AS
SELECT
    s.id,
    s.name,
    s.original_name,
    s.first_air_date,
    s.last_air_date,
    s.seasons,
    s.episodes,
    s.status,
    s.overview,
    s.popularity,
    s.tmdb_rating,
    s.vote_count,
    s.poster_url,
    s.backdrop_url,
    -- Aggregate genres
    COALESCE(STRING_AGG(DISTINCT g.name, '; ' ORDER BY g.name), '') AS genres,
    -- Aggregate networks
    COALESCE(STRING_AGG(DISTINCT n.name, '; ' ORDER BY n.name), '') AS networks,
    -- Aggregate creators
    COALESCE(STRING_AGG(DISTINCT c.name, '; ' ORDER BY c.name), '') AS creators,
    -- Aggregate studios
    COALESCE(STRING_AGG(DISTINCT st.name, '; ' ORDER BY st.name), '') AS studios,
    -- Aggregate actors (top 10 by display_order)
    COALESCE(
        STRING_AGG(
            DISTINCT a.name, '; '
            ORDER BY a.name
        ) FILTER (WHERE sa.display_order <= 10),
        ''
    ) AS top_actors
FROM tv_shows s
LEFT JOIN show_genres sg ON s.id = sg.show_id
LEFT JOIN genres g ON sg.genre_id = g.id
LEFT JOIN show_networks sn ON s.id = sn.show_id
LEFT JOIN networks n ON sn.network_id = n.id
LEFT JOIN show_creators sc ON s.id = sc.show_id
LEFT JOIN creators c ON sc.creator_id = c.id
LEFT JOIN show_studios ss ON s.id = ss.show_id
LEFT JOIN studios st ON ss.studio_id = st.id
LEFT JOIN show_actors sa ON s.id = sa.show_id
LEFT JOIN actors a ON sa.actor_id = a.id
GROUP BY
    s.id, s.name, s.original_name, s.first_air_date, s.last_air_date,
    s.seasons, s.episodes, s.status, s.overview, s.popularity,
    s.tmdb_rating, s.vote_count, s.poster_url, s.backdrop_url;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on tv_shows
CREATE TRIGGER update_tv_shows_updated_at
    BEFORE UPDATE ON tv_shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE tv_shows IS 'Core TV show information';
COMMENT ON TABLE actors IS 'Actor information';
COMMENT ON TABLE networks IS 'Broadcasting network information';
COMMENT ON TABLE genres IS 'Genre categories';
COMMENT ON TABLE creators IS 'Show creators/writers';
COMMENT ON TABLE studios IS 'Production companies/studios';
COMMENT ON TABLE show_actors IS 'Many-to-many relationship between shows and actors with character info';
COMMENT ON TABLE show_networks IS 'Many-to-many relationship between shows and networks';
COMMENT ON TABLE show_genres IS 'Many-to-many relationship between shows and genres';
COMMENT ON TABLE show_creators IS 'Many-to-many relationship between shows and creators';
COMMENT ON TABLE show_studios IS 'Many-to-many relationship between shows and studios';
COMMENT ON VIEW shows_complete IS 'Denormalized view of shows with all related data for easy querying';
