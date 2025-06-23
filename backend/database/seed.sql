-- Seed data for Academic Vault Database
USE dsn_settat;

-- Insert professors
INSERT INTO professors (id, name, email, department) VALUES
('1', 'Prof. RIAD Chakir', 'riad.chakir@university.ma', 'Law'),
('2', 'Prof. ZIYANI Mehdi', 'ziyani.mehdi@university.ma', 'Cybersecurity'),
('3', 'Prof. BADIL Manal', 'badil.manal@university.ma', 'Law'),
('4', 'Prof. JAMRI Fatima zahra', 'jamri.fatima@university.ma', 'Law'),
('5', 'Prof. EL ANTRI Khalid', 'elantri.khalid@university.ma', 'Law'),
('6', 'Prof. ASSADI Fatima', 'assadi.fatima@university.ma', 'Law');

-- Insert modules
INSERT INTO modules (id, name, code, description) VALUES
('1', 'Parcours du droit des contrats électroniques', 'PDCE', 'Study of electronic contract law'),
('2', 'Les institutions et acteurs de la cybersécurité', 'IAC', 'Cybersecurity institutions and actors'),
('3', 'Droit des communications électroniques', 'DCE', 'Electronic communications law'),
('4', 'Soft Skills', 'SS', 'Professional development skills'),
('5', 'Contrats informatiques', 'CI', 'IT contracts law'),
('6', 'Droit processuel', 'DP', 'Procedural law');

-- Insert admin user (Reda)
-- Password: 6redareda9@ (hashed with bcrypt)
INSERT INTO users (id, name, email, password, role) VALUES
('1', 'Reda', 'redamaster777@gmail.com', '$2a$10$hzQhYs9JXDZRZ7uy3LHJce2dpa5yoEDwQ2TOGjXC3Gaxrjk0o33.K', 'admin');

-- Note: No sample submissions or IP logs - these will be created by real users 