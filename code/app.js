// Importing necessary modules: express for the web server, body-parser for parsing request bodies, and axios for making HTTP requests
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

// Initialize the Express application
const app = express();
// Define the port on which the app will run
const port = 3000;

// Define the base API URL for making HTTP requests to another service (localhost:4000 in this case)
const API_URL = "http://localhost:4000";

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));
// Middleware to parse incoming JSON data from the request body
app.use(express.json());
// Middleware to parse URL-encoded form data from the request body
app.use(bodyParser.urlencoded({extended: true}));

// Route handler for the home page (GET request to '/')
app.get("/", async (req, res)=>{
    // Render the 'index.ejs' view when the home page is accessed
    res.render("index.ejs");
});

// Route handler for the 'create-account' page (GET request to '/create-account')
app.get("/create-account", async (req, res)=>{
    // Render the 'create-account.ejs' view when the create account page is accessed
    res.render("create-account.ejs");
});

// Start the server and listen on the specified port, logging a success message to the console
app.listen(port, ()=>{
    console.log(`Running on port ${port}`);  // Log that the server is running
});
