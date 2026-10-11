-- Initialisation basique (Laravel gérera le schéma via migrations)
CREATE DATABASE IF NOT EXISTS reclamations CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON reclamations.* TO 'app'@'%';
FLUSH PRIVILEGES;