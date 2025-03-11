// Importing necessary modules: express for the web server, body-parser for parsing request bodies, axios for making HTTP requests
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

// Variable to store the logged-in user (this approach is not ideal since it stores user data in memory, 
// making it unsuitable for multiple users. Consider using sessions instead.)
let user;

// Route handler for the home page (GET request to '/')
app.get("/", async (req, res) => {
    // Render the 'index.ejs' view when the home page is accessed
    res.render("index.ejs");
});

// Route handler for the 'create-account' page (GET request to '/create-account')
app.get("/create-account", async (req, res) => {
    // Render the 'create-account.ejs' view when the create account page is accessed
    res.render("create-account.ejs");
});

// Route to handle new account creation (POST request to '/new-account')
app.post("/new-account", async (req, res) => {
    try {
        // Send the user's form data to the API for account creation
        await axios.post(`${API_URL}/create-account`, req.body);
        
        // Redirect to the home page on success
        res.redirect("/");
    } catch (error) {
        console.error(error);

        // If there's an error (e.g., username is taken), re-render the create account page with an error message
        res.render("create-account.ejs", {
            error: "*This username is not available. Please choose another one."
        });
    }
});

// Route to handle user login (POST request to '/login')
app.post("/login", async (req, res) => {
    try {
        // Send login credentials to the API for authentication
        const result = await axios.post(`${API_URL}/login`, req.body);
        
        console.log(result.data);

        // Store the authenticated user data (again, storing in a variable is not recommended for production)
        user = result.data;

        // Check if the provided credentials match the stored user data
        if (user.nickname == req.body.nickname && user.password == req.body.password) {
            // If login is successful, render the books page
            res.render("books.ejs");
        } else {
            // If credentials are incorrect, re-render the login page with an error message
            res.render("index.ejs", {
                error: "*The nickname or password is incorrect."
            });
        }
    } catch (error) {
        console.error(error);

        // If an error occurs (e.g., invalid login), re-render the login page with an error message
        res.render("index.ejs", {
            error: "*The nickname or password is incorrect."
        });
    }
});

// Start the server and listen on the specified port, logging a success message to the console
app.listen(port, () => {
    console.log(`Running on port ${port}`);  // Log that the server is running
});
