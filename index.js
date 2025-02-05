const express = require("express");
const cors = require("cors");
const app = express();

const { initializeDatabase } = require("./db/db.connect");

app.use(cors());
app.use(express.json());

initializeDatabase();

const Books = require("./models/book.models");

app.get("/", (req, res) => {
  res.send("Hello, Express Server!");
});

async function createBook(newBook) {
  try {
    const book = new Books(newBook);
    const saveBook = await book.save();
    return saveBook;
  } catch (error) {
    throw error;
  }
}

app.post("/books", async (req, res) => {
  try {
    const saveBook = await createBook(req.body);
    res.status(201).json({ message: "Movie added successfully!", saveBook });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to add book." });
  }
});

async function readAllBooks() {
  try {
    const books = await Books.find();
    return books;
  } catch (error) {
    throw error;
  }
}

app.get("/books", async (req, res) => {
  try {
    const books = await readAllBooks(req.body);
    if (books) {
      res.json(books);
    } else {
      res.status(404).json({ error: "Books not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books." });
  }
});

async function readBookByTitle(bookTitle) {
  try {
    const book = await Books.findOne({ title: bookTitle });
    return book;
  } catch (error) {
    throw error;
  }
}

app.get("/books/:bookTitle", async (req, res) => {
  try {
    const book = await readBookByTitle(req.params.bookTitle);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book." });
  }
});

async function readBooksByAuthor(authorName) {
  try {
    const books = await Books.find({ author: authorName });
    return books;
  } catch (error) {
    throw error;
  }
}

app.get("/books/author/:authorName", async (req, res) => {
  try {
    const books = await readBooksByAuthor(req.params.authorName);
    if (books) {
      res.json(books);
    } else {
      res.status(404).json({ error: "Books not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books." });
  }
});

async function readBooksByBusinessGenre(bookGenre) {
  try {
    const books = await Books.find({
      genre: { $regex: `${bookGenre}$`, $options: "i" },
    });
    return books;
  } catch (error) {
    throw error;
  }
}

app.get("/books/genre/:bookGenre", async (req, res) => {
  try {
    const books = await readBooksByBusinessGenre(req.params.bookGenre);
    console.log("Fetched Books by Genre: ", books);

    if (books.length != 0) {
      res.json(books);
    } else {
      res.status(404).json({ error: "Books not found for the given genre." });
    }
  } catch (error) {
    console.error("Error fetching books by genre:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch books for the given genre." });
  }
});

async function readBooksByReleaseYear(releaseYear) {
  try {
    const books = await Books.find({ publishedYear: releaseYear });
    return books;
  } catch (error) {
    throw error;
  }
}

app.get("/books/year/:releaseYear", async (req, res) => {
  try {
    const books = await readBooksByReleaseYear(req.params.releaseYear);
    if (books.length > 0) {
      res.json(books);
    } else {
      res.status(404).json({ error: "No book found for the given year." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books by the given year." });
  }
});

async function updateBookById(bookId, dataToUpdate) {
  try {
    const updatedBook = await Books.findByIdAndUpdate(bookId, dataToUpdate, {
      new: true,
    });
    return updatedBook;
  } catch (error) {
    console.log("Error in updating book.", error.message);
  }
}

app.post("/books/:bookId", async (req, res) => {
  try {
    const updatedBook = await updateBookById(req.params.bookId, req.body);
    if (updatedBook) {
      res
        .status(200)
        .json({ message: "Book updated successfully.", updatedBook });
    } else {
      res.status(404).json({ error: "Book does not exist." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update book." });
  }
});

async function updateBookByTitle(bookTitle, dataToUpdate) {
  try {
    const updatedBook = await Books.findOneAndUpdate(
      { title: bookTitle },
      dataToUpdate,
      { new: true }
    );
    return updatedBook;
  } catch (error) {
    console.log("Error in updating book.", error.message);
  }
}

app.post("/books/title/:bookTitle", async (req, res) => {
  try {
    const updatedBook = await updateBookByTitle(req.params.bookTitle, req.body);
    if (updatedBook) {
      res
        .status(200)
        .json({ message: "Book updated successfully.", updatedBook });
    } else {
      res.status(404).json({ error: "No book found." });
    }
  } catch (error) {
    console.log("Error while updating book.", error.message);
    res.status(500).json({ error: "Failed to update book." });
  }
});

async function deleteBookById(bookId) {
  try {
    const deletedBook = await Books.findByIdAndDelete(bookId);
    return deletedBook;
  } catch (error) {
    console.log(error);
  }
}

app.delete("/books/:bookId", async (req, res) => {
  try {
    const deletedBook = await deleteBookById(req.params.bookId);
    if (deletedBook) {
      res
        .status(200)
        .json({ message: "Book deleted successfully.", deletedBook });
    } else {
      res.status(404).json({ error: "Book not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete book." });
  }
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});
