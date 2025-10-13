CREATE TABLE Actor
(
  ActorID INT NOT NULL,
  Actor_Name INT NOT NULL,
  Profile_URL INT NOT NULL,
  PRIMARY KEY (ActorID)
);

CREATE TABLE Genre
(
  GenreID INT NOT NULL,
  Genre_Name INT NOT NULL,
  PRIMARY KEY (GenreID)
);

CREATE TABLE TVShow
(
  ShowID INT NOT NULL,
  Name INT NOT NULL,
  Original_Name INT NOT NULL,
  First_air_date INT NOT NULL,
  Last_air_date INT NOT NULL,
  Seasons INT NOT NULL,
  Episodes INT NOT NULL,
  Status INT NOT NULL,
  Overview INT NOT NULL,
  Popularity INT NOT NULL,
  TMDb_Rating INT NOT NULL,
  Vote_Count INT NOT NULL,
  Poster_URL INT NOT NULL,
  Backdrop_URL INT NOT NULL,
  PRIMARY KEY (ShowID)
);

CREATE TABLE Character
(
  CharacterID INT NOT NULL,
  Character_Name INT NOT NULL,
  ActorID INT NOT NULL,
  ShowID INT NOT NULL,
  PRIMARY KEY (CharacterID),
  FOREIGN KEY (ActorID) REFERENCES Actor(ActorID),
  FOREIGN KEY (ShowID) REFERENCES TVShow(ShowID)
);

CREATE TABLE Creator
(
  Creator_Name INT NOT NULL,
  CreatorID INT NOT NULL,
  PRIMARY KEY (CreatorID)
);

CREATE TABLE Network
(
  NetworkID INT NOT NULL,
  Network_Name INT NOT NULL,
  Logo_URL INT NOT NULL,
  Country INT NOT NULL,
  PRIMARY KEY (NetworkID)
);

CREATE TABLE Studio
(
  StudioID INT NOT NULL,
  Studio_Name INT NOT NULL,
  Logo_URL INT NOT NULL,
  Country INT NOT NULL,
  PRIMARY KEY (StudioID)
);

CREATE TABLE categorized_as
(
  GenreID INT NOT NULL,
  ShowID INT NOT NULL,
  PRIMARY KEY (GenreID, ShowID),
  FOREIGN KEY (GenreID) REFERENCES Genre(GenreID),
  FOREIGN KEY (ShowID) REFERENCES TVShow(ShowID)
);

CREATE TABLE created_by
(
  CreatorID INT NOT NULL,
  ShowID INT NOT NULL,
  PRIMARY KEY (CreatorID, ShowID),
  FOREIGN KEY (CreatorID) REFERENCES Creator(CreatorID),
  FOREIGN KEY (ShowID) REFERENCES TVShow(ShowID)
);

CREATE TABLE produced_by
(
  StudioID INT NOT NULL,
  ShowID INT NOT NULL,
  PRIMARY KEY (StudioID, ShowID),
  FOREIGN KEY (StudioID) REFERENCES Studio(StudioID),
  FOREIGN KEY (ShowID) REFERENCES TVShow(ShowID)
);

CREATE TABLE features
(
  ActorID INT NOT NULL,
  ShowID INT NOT NULL,
  PRIMARY KEY (ActorID, ShowID),
  FOREIGN KEY (ActorID) REFERENCES Actor(ActorID),
  FOREIGN KEY (ShowID) REFERENCES TVShow(ShowID)
);

CREATE TABLE broadcast_by
(
  ShowID INT NOT NULL,
  NetworkID INT NOT NULL,
  PRIMARY KEY (ShowID, NetworkID),
  FOREIGN KEY (ShowID) REFERENCES TVShow(ShowID),
  FOREIGN KEY (NetworkID) REFERENCES Network(NetworkID)
);