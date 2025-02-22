-- Create Database and User
CREATE DATABASE booknest;
CREATE USER 'bookuser'@'%' IDENTIFIED BY 'DevOps123';
GRANT ALL PRIVILEGES ON booknest.* TO 'bookuser'@'%';
FLUSH PRIVILEGES;

-- Create Tables
CREATE TABLE `author` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `birthday` DATE NOT NULL,
  `bio` TEXT NOT NULL,
  `createdAt` DATE NOT NULL,
  `updatedAt` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `book` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `releaseDate` DATE NOT NULL,
  `description` TEXT NOT NULL,
  `pages` INT NOT NULL,
  `createdAt` DATE NOT NULL,
  `updatedAt` DATE NOT NULL,
  `authorId` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_66a4f0f47943a0d99c16ecf90b2` (`authorId`),
  CONSTRAINT `FK_66a4f0f47943a0d99c16ecf90b2`
    FOREIGN KEY (`authorId`) REFERENCES `author` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert Authors
INSERT INTO author (name, birthday, bio, createdAt, updatedAt)
VALUES
  ('J.K. Rowling', '1965-07-31', 'British author best known for the Harry Potter series.', NOW(), NOW()),
  ('Jane Austen', '1775-12-16', 'English novelist known for her keen social commentary and romantic novels.', NOW(), NOW()),
  ('Harper Lee', '1926-04-28', 'American novelist best known for To Kill a Mockingbird.', NOW(), NOW()),
  ('J.R.R. Tolkien', '1892-01-03', 'Renowned British writer famous for The Hobbit and The Lord of the Rings.', NOW(), NOW()),
  ('Mary Shelley', '1797-08-30', 'English novelist who wrote Frankenstein, a Gothic masterpiece.', NOW(), NOW());

-- Insert Books
INSERT INTO book (title, releaseDate, description, pages, createdAt, updatedAt, authorId)
VALUES
  ('Harry Potter and the Philosopher''s Stone', '1997-06-26', 'The first book in the Harry Potter series, introducing readers to a world of magic and wonder.', 223, NOW(), NOW(), 8),
  ('Harry Potter and the Chamber of Secrets', '1998-07-02', 'The second installment in the series, where mystery and danger await at Hogwarts.', 251, NOW(), NOW(), 9),
  ('Pride and Prejudice', '1813-01-28', 'A classic novel exploring the nuances of manners, marriage, and society in early 19th century England.', 432, NOW(), NOW(), 8),
  ('To Kill a Mockingbird', '1960-07-11', 'A powerful novel addressing racial injustice and moral growth in the American South.', 281, NOW(), NOW(), 10),
  ('The Lord of the Rings: The Fellowship of the Ring', '1954-07-29', 'The first volume of an epic trilogy that sets the stage for a battle against evil forces in Middle-earth.', 423, NOW(), NOW(), 11),
  ('Frankenstein; or, The Modern Prometheus', '1818-01-01', 'A Gothic tale of a scientist who creates a sentient creature, exploring themes of ambition and responsibility.', 280, NOW(), NOW(), 12);