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
app.use(bodyParser.urlencoded({ extended: true }));

// Function to search for a book by title using the Open Library API
async function searchBook(title) {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`;
    try {
        const response = await axios.get(url);
        const book = response.data.docs[0];
        return book;
    } catch (error) {
        console.error("Book not found.");
        throw new Error("Book not found.");
    }
}

// Store user data in memory (this is temporary)
let user;

// Route handler for the home page (GET request to '/')
app.get("/", (req, res) => {
    res.render("index.ejs"); // Render the 'index.ejs' view when the home page is accessed
});

// Route handler for the 'create-account' page (GET request to '/create-account')
app.get("/create-account", (req, res) => {
    res.render("create-account.ejs"); // Render the 'create-account.ejs' view
});

// Route to handle new account creation (POST request to '/new-account')
app.post("/new-account", async (req, res) => {
    try {
        // Send the user's form data to the API for account creation
        await axios.post(`${API_URL}/create-account`, req.body);
        res.redirect("/"); // Redirect to the home page on success
    } catch (error) {
        console.error(error);
        res.render("create-account.ejs", {
            error: "*This username is not available. Please choose another one." // Display error message
        });
    }
});

// Route to handle user login (POST request to '/login')
app.post("/login", async (req, res) => {
    try {
        const result = await axios.post(`${API_URL}/login`, req.body); // Send login credentials to the API
        user = result.data; // Store the authenticated user data in memory

        // Check if credentials match the stored user data
        if (user.nickname === req.body.nickname && user.password === req.body.password) {
            res.redirect("/books"); // Redirect to books page if login is successful
        } else {
            res.render("index.ejs", { error: "*The nickname or password is incorrect." }); // Show error if credentials are incorrect
        }
    } catch (error) {
        console.error(error);
        res.render("index.ejs", { error: "*The nickname or password is incorrect." }); // Show error if login fails
    }
});

// Route to display books (GET request to '/books')
app.get("/books", async (req, res) => {
    try {
        const result = await axios.get(`${API_URL}/books`); // Fetch books from the API
        const books = result.data;
        res.render("books.ejs", { user: user.nickname, books: books }); // Render the books page
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching books");
    }
});

// Route to display the new book creation page (GET request to '/books/new')
app.get("/books/new", (req, res) => {
    res.render("new-book.ejs", { user: user.nickname }); // Render the new book page
});

// Route to search for a book (POST request to '/books/new/search')
app.post("/books/new/search", async (req, res) => {
    try {
        const result = await searchBook(req.body.book_title); // Search for the book using the searchBook function
        res.render("new-book.ejs", { user: user.nickname, book: result }); // Display the book details
    } catch (error) {
        res.render("new-book.ejs", { user: user.nickname, error: "*The book is not found." }); // Show error if book is not found
    }
});

// Route to create a new book note (POST request to '/books/new/create')
app.post("/books/new/create", async (req, res) => {
    const { title, author, score, note, cover } = req.body; // Destructure form data

    const book = {
        title,
        author,
        score: parseInt(score, 10),
        note,
        cover,
        user_id: user.id, // Attach user ID
    };

    try {
        await axios.post(`${API_URL}/books/add`, book); // Send the new book data to the API
        res.redirect("/books"); // Redirect to the books page after successfully adding the book
    } catch (error) {
        console.error(error);
        res.redirect("/books"); // Redirect back to the books page if an error occurs
    }
});

// Route to delete the book (Get request to '/books/delete/:id')
app.get("/books/delete/:id", async (req, res) => {
    // Extract book id
    const bookId = req.params.id;

    try {
        await axios.delete(`${API_URL}/books/delete/${bookId}`);  // Delete request to API for delete the book
        res.redirect("/books");  // Redirect back to the books page after successfully deleting the book
    } catch (error) {
        console.error(error);
        res.redirect("/books");  // Redirect back to the books page if an error occurs
    }
});
            

// Start the server and listen on the specified port, logging a success message to the console
app.listen(port, () => {
    console.log(`Running on port ${port}`);
});
