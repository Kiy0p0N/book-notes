// Import necessary modules
import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import axios from 'axios';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
import env from 'dotenv';

const app = express();  // Initialize the Express application
const port = 3000;  // Define the port on which the app will run
const salt = 10;  // The salt to be used in encryption
env.config();  // Loads .env file contents into process.env

// Configure the PostgreSQL client with necessary database connection details
const db = new pg.Client({
  user: process.env.PG_USER,
  database: process.env.PG_DATABASE,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});

// Try to establish a connection with the PostgreSQL database
try {
  db.connect();
  console.log("Connected to the database");
} catch (error) {
  console.error("Error connecting to database:", error);
}

app.use(bodyParser.urlencoded({ extended: true }));  // Middleware to parse URL-encoded data (form data) from the request body
app.use(express.static('public'));  // Middleware to serve static files from the 'public' directory

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,  // Secret key for session encryption
    resave: false,  // Prevents resaving session if nothing changed
    saveUninitialized: true,  // Saves uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365,  // Session expires after 1 year
    },
  })
);

app.use(passport.initialize());  // Initializes Passport authentication middleware
app.use(passport.session());  // Enables persistent login sessions

// Route handlers
app.get("/", async (req, res) => {
  try {
    // Retrieve all books from database, arranged from highest to lowest according to the 'score' column
    const response = await db.query("SELECT * FROM books ORDER BY score DESC");
    const books = response.rows;

    // if there is a user in the session return the books and the user
    if (req.user) {
      res.render("books.ejs", { books, user: req.user });
    } else {
      res.render("books.ejs", { books });
    }
  } catch (error) {
    console.error("Error to search in database:", error);
    res.render("books.ejs");
  }
  
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", async (req, res) => {
  try {
    // Retrieve all users from database
    const response = await db.query("SELECT * FROM users");
    
    /* If there is no user in the database, return to the registration screen.
     This is to prevent more than 1 user from being able to add or remove books.
     Thus, only one user is able to manipulate the books */
    if (response.rowCount === 0) {
      res.render("register.ejs");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error to search in database:", error);
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  // Ends user session
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.get("/book/delete/:id", async (req, res) => {
  const bookId = req.params.id;
  
  try {
    // Deletes the selected book from the database based on id
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
  } catch (error) {
    console.error("Error to delete in database:", error);
  }
  
  res.redirect("/");
});

/* Applies the nameed strategy (or strategies) to the incoming request, in order to authenticate the request.
If authentication is successful, the user will be logged in and populated at req.user and a session will be established by default.
If authentication fails, an unauthorized response will be sent. */
app.post("/login", passport.authenticate("local", {
  successRedirect: "/",  // After successful login, redirect to given URL
  failureRedirect: "/login",  // After failed login, redirect to given URL
}));


// Register the user
app.post("/register", async (req, res) => {
  const {name, email, password} = req.body;

  try {
    // Checks if the email is already in the database
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    // If it already exists, returns the user to the login screen
    if (checkUser.rows[0]) {
      console.log("Email already exists. Try logging in.");
      res.redirect("/login");
    } else {
      /* Creates a hashed password.
      A hashed password is a sequence of characters that results from transforming a password using a mathematical function.
      This sequence is used to store the password securely. */
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          console.log("Error hashing password: ", err);
          res.redirect("/register");
        } else {
          try {
            // Adds user information to the database
            const response = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, hash]);
            const user = response.rows[0];

            // Initiate a login session for user.
            req.login(user, (err) => {
              if (err) console.log(err);
              res.redirect("/");
            });
          } catch (error) {
            console.log("Error registering user: ", error);
            res.redirect("/register");
          }
        }
      });
    }
  } catch (error) {
    console.error("Database query error: ", error);
    res.redirect("/register");
  }
});

// Search for the book
app.post("/add/search", async (req, res) => {
  const bookName = req.body.bookName;
  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(bookName)}`;  // URL to search for a book in the OpenLibrary API
  
  try {
    // Search for the book in the OpenLibrary API
    const result = await axios.get(url);
    const book = result.data.docs[0];  // Get the first result

    res.render("add.ejs", { book: book });
  } catch (error) {
    console.log("Error searching for book:", error);
    res.redirect("/add");
  }
});

// Add review
app.post("/add-review", async (req, res) => {
  const {title, author, cover, score, notes} = req.body;

  try {
    // Adds book information to the database
    await db.query("INSERT INTO books (title, author, cover, score, notes) VALUES ($1, $2, $3, $4, $5)", [title, author, cover, score, notes]);

    res.redirect("/");
  } catch (error) {
    console.log("Error to insert in database:", error);
    res.redirect("/add");
  }
});

// Configure Passport authentication strategy for local login
passport.use("local",
  new Strategy({ usernameField: "email" }, async function verify(email, password, cb) {
    try {
      // Fetch user from database by email
      const response = await db.query("SELECT * FROM users WHERE email = $1", [email]);

      if (response.rows[0]) {
        const user = response.rows[0];
        const storedPassword = user.password;

        // Compare the provided password with the stored hash
        bcrypt.compare(password, storedPassword, (err, result) => {
          if (err) {
            console.log("Error comparing passwords: ", err);
            return cb(err);
          } else {
            if (result) {
              return cb(null, user);  // Authentication successful
            } else {
              console.log("Incorrect password");
              return cb(null, false);  // Incorrect password
            }
          }
        });
      } else {
        console.log("User not found");
        return cb("User not found");
      }
    } catch (error) {
      console.error("Database query error: ", error);
      return cb(error);
    }
  })
);

// Registers a function used to serialize user objects into the session
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

// Registers a function used to deserialize user objects out of the session
passport.deserializeUser(async (id, cb) => {
  try {
    const response = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (response.rows.length > 0) {
      cb(null, response.rows[0]);
    } else {
      cb("User not found");
    }
  } catch (error) {
    cb(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});