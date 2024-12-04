CREATE EXTENSION IF NOT EXISTS pgcrypto; 

-- User Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50),
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    preferences TEXT,
    travelHistory TEXT
);

-- UserSecret Table
CREATE TABLE UserSecret (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES Users(id),
    password VARCHAR(255)
);
