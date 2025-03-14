// Importing necessary modules: express for the web server, body-parser for parsing request bodies, and pg for PostgreSQL database interaction
import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

// Initialize the Express application
const app = express();
// Define the port on which the app will run
const port = 4000;

// Configure the PostgreSQL client with necessary database connection details
const db = new pg.Client({
    user: 'postgres',       // Database user
    database: 'book-notes', // Name of the database
    host: 'localhost',      // Host where the database is running
    password: 'hades',      // Password for the database user (Consider using environment variables instead of hardcoding credentials)
    port: 5432              // Port on which the database is listening (default PostgreSQL port)
});

// Try to establish a connection with the PostgreSQL database
try {
    db.connect();           // Establish the database connection
    console.log("Connected to the database");  // Log success message to console
} catch (error) {
    console.error(error);   // Log any error that occurs during connection
}

// Middleware to parse URL-encoded data (form data) from the request body
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON data from the request body
app.use(express.json());

let user;

// Route to handle account creation (POST request to '/create-account')
app.post("/create-account", async (req, res) => {
    let nickname = req.body.nickname;
    let password = req.body.password;

    try {
        // Insert new user into the database
        await db.query(
            "INSERT INTO users (nickname, password) VALUES ($1, $2)",
            [nickname, password]
        );

        // Respond with success message
        res.status(201).json({ message: "Account created successfully" });

    } catch (error) {
        console.error(error);
        
        // If an error occurs, return a 500 status with an error message
        res.status(500).json({ error: "Error creating account" });
    }
});

// Route to handle user login (POST request to '/login')
app.post("/login", async (req, res) => {
    const nickname = req.body.nickname;
    const password = req.body.password;

    try {
        // Query the database for a user matching the provided nickname and password
        const response = await db.query(
            "SELECT * FROM users WHERE nickname = $1 AND password = $2",
            [nickname, password]
        );

        user = response.rows[0];

        // If a user is found, return the user data
        res.json(user);

    } catch (error) {
        console.error(error);

        // If an error occurs, return a 500 status with an error message
        res.status(500).json({ error: "Error searching for user" });
    }
});

// Route to handle displaying books for a specific user (GET request to '/books')
app.get("/books", async (req, res) => {
    try {
        // Query the books related to the user from the database
        const response = await db.query(
            "SELECT * FROM books WHERE user_id = $1 ORDER BY score DESC",
            [user.id]
        );

        // Send the list of books as the response
        res.json(response.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching books" });
    }
});

// Route to handle adding a new book (POST request to '/books/add')
app.post("/books/add", async (req, res) => {
    // Extract book data from the request body
    const { title, author, cover, score, note, user_id } = req.body;

    console.log(title, author, cover, score, note, user_id);

    // Ensure that the required fields are provided
    if (!title || !author ||  !cover || !score || !note || !user_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Insert the new book into the 'books' table in the database
        await db.query(
            "INSERT INTO books (title, author, img_link, score, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6)",
            [title, author, cover, score, user_id, note]
        );

        // Respond with a success message
        res.status(201).json({ message: "Book added successfully" });
    } catch (error) {
        console.error(error);
        
        // If an error occurs, return a 500 status with an error message
        res.status(500).json({ error: "Error adding book" });
    }
});

// Route to delete the book (Delete request to '/books/delete/:id')
app.delete("/books/delete/:id", async (req, res) => {
    // Extract book id
    const bookId = req.params.id;

    try {
        // Delete the book according to the id
        await db.query(
            "DELETE FROM books WHERE id = $1",
            [bookId]
        );

        // Respond with a success message
        res.status(201).json({ message: "Book deleted successfully "});
    } catch (error) {
        console.error(error);

        // If an error occurs, return a 500 status with an error message
        return res.status(400).json({ error: "Error deleting book" });
    }
});

// Start the server and listen on the specified port, logging a success message to the console
app.listen(port, () => {
    console.log(`Running on port ${port}`);
});