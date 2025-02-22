const db = require('../configs/db');
const { systemLogger, businessLogger } = require('../logger');

function BooksController() {}

const getQuery = `SELECT b.id as id, b.title as title, b.releaseDate as releaseDate, 
  b.description as description, b.pages as pages, b.createdAt as createdAt, 
  b.updatedAt as updatedAt, a.id as authorId, a.name as name, a.birthday as birthday, 
  a.bio as bio FROM book b INNER JOIN author a on b.authorId = a.id`;

BooksController.prototype.get = async (req, res) => {
  try {
    db.query(getQuery, (err, books) => {
      if (err) {
        systemLogger.error("Error executing get query in BooksController.get", {
          event: "BOOKS_GET_ERROR",
          error: err,
          endpoint: req.url,
          method: req.method
        });
        return res.status(500).json({
          message: "Something unexpected has happened. Please try again later."
        });
      }
      // Log detailed business metric for viewing books
      businessLogger.info("BOOKS_VIEWED", {
        event: "BOOKS_VIEWED",
        count: books.length,
        // Capture IDs and titles for richer insights
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          authorId: book.authorId
        })),
        endpoint: req.url,
        method: req.method
      });
      res.status(200).json({ books });
    });
  } catch (error) {
    systemLogger.error("Exception in BooksController.get", {
      event: "BOOKS_GET_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

BooksController.prototype.create = async (req, res) => {
  try {
    const { title, description, releaseDate, pages, author: authorId } = req.body;
    db.query(
      'INSERT INTO book (title, releaseDate, description, pages, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, new Date(releaseDate), description, pages, authorId, new Date(), new Date()],
      (err, result) => {
        if (err) {
          systemLogger.error("Error executing create query in BooksController.create", {
            event: "BOOK_CREATE_ERROR",
            error: err,
            requestBody: req.body,
            endpoint: req.url,
            method: req.method
          });
          return res.status(500).json({
            message: "Something unexpected has happened. Please try again later."
          });
        }
        db.query(getQuery, (err, books) => {
          if (err) {
            systemLogger.error("Error executing get query after create in BooksController.create", {
              event: "BOOK_CREATE_GET_ERROR",
              error: err,
              endpoint: req.url,
              method: req.method
            });
            return res.status(500).json({
              message: "Something unexpected has happened. Please try again later."
            });
          }
          // Log business metric for book creation
          businessLogger.info("BOOK_CREATED", {
            event: "BOOK_CREATED",
            book: {
              id: result.insertId,
              title,
              authorId
            },
            endpoint: req.url,
            method: req.method
          });
          return res.status(200).json({
            message: "Book created successfully!",
            books
          });
        });
      }
    );
  } catch (error) {
    systemLogger.error("Exception in BooksController.create", {
      event: "BOOK_CREATE_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

BooksController.prototype.update = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, description, releaseDate, pages, author: authorId } = req.body;
    db.query(
      'UPDATE book SET title = ?, releaseDate = ?, description = ?, pages = ?, authorId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title, new Date(releaseDate), description, pages, authorId, bookId],
      (err) => {
        if (err) {
          systemLogger.error("Error executing update query in BooksController.update", {
            event: "BOOK_UPDATE_ERROR",
            error: err,
            bookId,
            requestBody: req.body,
            endpoint: req.url,
            method: req.method
          });
          return res.status(500).json({
            message: "Something unexpected has happened. Please try again later."
          });
        }
        db.query(getQuery, (err, books) => {
          if (err) {
            systemLogger.error("Error executing get query after update in BooksController.update", {
              event: "BOOK_UPDATE_GET_ERROR",
              error: err,
              endpoint: req.url,
              method: req.method
            });
            return res.status(500).json({
              message: "Something unexpected has happened. Please try again later."
            });
          }
          // Log business metric for book update
          businessLogger.info("BOOK_UPDATED", {
            event: "BOOK_UPDATED",
            book: {
              id: bookId,
              title,
              authorId
            },
            endpoint: req.url,
            method: req.method
          });
          return res.status(200).json({
            message: "Book updated successfully!",
            books
          });
        });
      }
    );
  } catch (error) {
    systemLogger.error("Exception in BooksController.update", {
      event: "BOOK_UPDATE_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

BooksController.prototype.delete = async (req, res) => {
  try {
    const bookId = req.params.id;
    db.query('DELETE FROM book WHERE id = ?', [bookId], (err) => {
      if (err) {
        systemLogger.error("Error executing delete query in BooksController.delete", {
          event: "BOOK_DELETE_ERROR",
          error: err,
          bookId,
          endpoint: req.url,
          method: req.method
        });
        return res.status(500).json({
          message: "Something unexpected has happened. Please try again later."
        });
      }
      db.query(getQuery, (err, books) => {
        if (err) {
          systemLogger.error("Error executing get query after delete in BooksController.delete", {
            event: "BOOK_DELETE_GET_ERROR",
            error: err,
            endpoint: req.url,
            method: req.method
          });
          return res.status(500).json({
            message: "Something unexpected has happened. Please try again later."
          });
        }
        // Log business metric for book deletion
        businessLogger.info("BOOK_DELETED", {
          event: "BOOK_DELETED",
          bookId,
          endpoint: req.url,
          method: req.method
        });
        return res.status(200).json({
          message: "Book deleted successfully!",
          books
        });
      });
    });
  } catch (error) {
    systemLogger.error("Exception in BooksController.delete", {
      event: "BOOK_DELETE_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

module.exports = new BooksController();