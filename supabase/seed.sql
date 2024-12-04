-- Insert data into Users table
INSERT INTO Users (id, username, email, role, firstName, lastName, preferences, travelHistory)
VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@talentedge.ai', 'admin', 'John', 'Doe', 'nature', null),
('22222222-2222-2222-2222-222222222222', 'user', 'user@talentedge.ai', 'user', 'Jane', 'Smith', 'adventure', null);

-- Insert data into UserSecret table
INSERT INTO UserSecret (userId, password)
VALUES
('11111111-1111-1111-1111-111111111111', crypt('password123', gen_salt('bf'))),
('22222222-2222-2222-2222-222222222222', crypt('securepass', gen_salt('bf')));
