const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user. Username and password are required." });
  }

  if (isValid(username)) {
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
  } else {
    return res.status(409).json({ message: "User already exists!" });
  }
});

// Task 1 & Task 10: Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await new Promise((resolve) => {
      resolve(books);
    });
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

// Task 2 & Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBNPromise = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error(`Book with ISBN ${isbn} not found`));
    }
  });

  getBookByISBNPromise
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 3 & Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const authorParam = req.params.author.toLowerCase();
    const matchingBooks = await new Promise((resolve) => {
      const results = [];
      const isbns = Object.keys(books);
      isbns.forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === authorParam) {
          results.push({
            isbn: isbn,
            title: books[isbn].title,
            reviews: books[isbn].reviews
          });
        }
      });
      resolve(results);
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbyauthor: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: `No books found for author '${req.params.author}'` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
  }
});

// Task 4 & Task 13: Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const titleParam = req.params.title.toLowerCase();
    const matchingBooks = await new Promise((resolve) => {
      const results = [];
      const isbns = Object.keys(books);
      isbns.forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === titleParam) {
          results.push({
            isbn: isbn,
            author: books[isbn].author,
            reviews: books[isbn].reviews
          });
        }
      });
      resolve(results);
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbytitle: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: `No books found with title '${req.params.title}'` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title", error: error.message });
  }
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// =========================================================================
// Tasks 10-13: Async/Await & Promise Callback functions using Axios
// =========================================================================

const BASE_URL = "http://localhost:5000";

// Task 10: Get the list of books available in the shop using async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch books: ${error.message}`);
  }
};

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
const getBookByISBN = (isbn) => {
  return axios
    .get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(`Failed to fetch book with ISBN ${isbn}: ${error.message}`);
    });
};

// Task 12: Get book details based on Author using async/await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch books by author ${author}: ${error.message}`);
  }
};

// Task 13: Get book details based on Title using async/await with Axios
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch books by title ${title}: ${error.message}`);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
