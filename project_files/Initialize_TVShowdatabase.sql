-- TVShow Database Initialization Script
-- This script creates the main TVShow table for the API

CREATE TABLE IF NOT EXISTS tvshows (
  showid VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  originalname VARCHAR,
  firstairdate VARCHAR,
  lastairdate VARCHAR,
  seasons VARCHAR,
  episodes VARCHAR,
  status VARCHAR,
  overview TEXT,
  popularity VARCHAR,
  tmdb_rating VARCHAR,
  vote_count VARCHAR,
  poster_url VARCHAR,
  backdrop_url VARCHAR,
  genres VARCHAR
);

-- Create index on name for faster searching
CREATE INDEX IF NOT EXISTS idx_name ON tvshows(name);
CREATE INDEX IF NOT EXISTS idx_genres ON tvshows(genres);

-- Optional: Insert sample data (uncomment if needed)
-- INSERT INTO tvshows (showid, name, originalname, firstairdate, status, genres, overview)
-- VALUES ('1', 'Sample Show', 'Sample Show Original', '2024-01-01', 'Ended', 'Drama', 'A sample TV show');

-- Additional tables for future expansion (optional)

CREATE TABLE IF NOT EXISTS Actor (
  ActorID VARCHAR NOT NULL,
  Actor_Name VARCHAR NOT NULL,
  Profile_URL VARCHAR NOT NULL,
  PRIMARY KEY (ActorID)
);

CREATE TABLE IF NOT EXISTS Genre (
  GenreID VARCHAR NOT NULL,
  Genre_Name VARCHAR NOT NULL,
  PRIMARY KEY (GenreID)
);

CREATE TABLE IF NOT EXISTS Character (
  CharacterID VARCHAR NOT NULL,
  Character_Name VARCHAR NOT NULL,
  ActorID VARCHAR NOT NULL,
  ShowID VARCHAR NOT NULL,
  PRIMARY KEY (CharacterID),
  FOREIGN KEY (ActorID) REFERENCES Actor(ActorID),
  FOREIGN KEY (ShowID) REFERENCES tvshows(showid)
);

CREATE TABLE IF NOT EXISTS Creator (
  Creator_Name VARCHAR NOT NULL,
  CreatorID VARCHAR NOT NULL,
  PRIMARY KEY (CreatorID)
);

CREATE TABLE IF NOT EXISTS Network (
  NetworkID VARCHAR NOT NULL,
  Network_Name VARCHAR NOT NULL,
  Logo_URL VARCHAR NOT NULL,
  Country INT NOT NULL,
  PRIMARY KEY (NetworkID)
);

CREATE TABLE IF NOT EXISTS Studio (
  StudioID VARCHAR NOT NULL,
  Studio_Name VARCHAR NOT NULL,
  Logo_URL VARCHAR NOT NULL,
  Country VARCHAR NOT NULL,
  PRIMARY KEY (StudioID)
);

CREATE TABLE IF NOT EXISTS categorized_as (
  GenreID VARCHAR NOT NULL,
  ShowID VARCHAR NOT NULL,
  PRIMARY KEY (GenreID, ShowID),
  FOREIGN KEY (GenreID) REFERENCES Genre(GenreID),
  FOREIGN KEY (ShowID) REFERENCES tvshows(showid)
);

CREATE TABLE IF NOT EXISTS created_by (
  CreatorID VARCHAR NOT NULL,
  ShowID VARCHAR NOT NULL,
  PRIMARY KEY (CreatorID, ShowID),
  FOREIGN KEY (CreatorID) REFERENCES Creator(CreatorID),
  FOREIGN KEY (ShowID) REFERENCES tvshows(showid)
);

CREATE TABLE IF NOT EXISTS produced_by (
  StudioID VARCHAR NOT NULL,
  ShowID VARCHAR NOT NULL,
  PRIMARY KEY (StudioID, ShowID),
  FOREIGN KEY (StudioID) REFERENCES Studio(StudioID),
  FOREIGN KEY (ShowID) REFERENCES tvshows(showid)
);

CREATE TABLE IF NOT EXISTS features (
  ActorID VARCHAR NOT NULL,
  ShowID VARCHAR NOT NULL,
  PRIMARY KEY (ActorID, ShowID),
  FOREIGN KEY (ActorID) REFERENCES Actor(ActorID),
  FOREIGN KEY (ShowID) REFERENCES tvshows(showid)
);

CREATE TABLE IF NOT EXISTS broadcast_by (
  ShowID VARCHAR NOT NULL,
  NetworkID VARCHAR NOT NULL,
  PRIMARY KEY (ShowID, NetworkID),
  FOREIGN KEY (ShowID) REFERENCES tvshows(showid),
  FOREIGN KEY (NetworkID) REFERENCES Network(NetworkID)
);