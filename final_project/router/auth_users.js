const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid (not already taken)
const isValid = (username) => {
  // Check if the username already exists in the users array
  const user = users.find(user => user.username === username);
  return !user;
};

// Function to check if the username and password match the one we have in records
const authenticatedUser = (username, password) => {
  // Check if the user exists and the password matches
  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, "your_jwt_secret_key", { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username; // Assuming the username is extracted from the JWT

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Find the book by ISBN
  const book = books[isbn];
  
  if (book) {
    // If the book exists, add or update the review
    if (!book.reviews) {
      book.reviews = {};
    }
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
