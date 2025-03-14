CREATE DATABASE book-notes;

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	nickname VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(16) NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    img_link VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
	notes TEXT NOT NULL,
    UNIQUE (user_id, title)
);
