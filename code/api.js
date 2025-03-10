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
    password: 'hades',      // Password for the database user
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
app.use(bodyParser.urlencoded({extended: true}));
// Middleware to parse JSON data from the request body
app.use(express.json());

// Start the server and listen on the specified port, logging a success message to the console
app.listen(port, ()=>{
    console.log(`Running on port ${port}`);  // Log that the server is running
});
