const db = require('../configs/db');
const { systemLogger, businessLogger } = require('../logger');

function AuthorsController() {}

const getQuery = `SELECT a.id, a.name, a.birthday, a.bio, a.createdAt, a.updatedAt FROM author a`;

AuthorsController.prototype.get = async (req, res) => {
  try {
    db.query(getQuery, (err, authors) => {
      if (err) {
        systemLogger.error("Error executing get query in AuthorsController.get", {
          event: "AUTHORS_GET_ERROR",
          error: err,
          endpoint: req.url,
          method: req.method
        });
        return res.status(500).json({
          message: "Something unexpected has happened. Please try again later."
        });
      }
      // Log detailed business metric for viewing authors
      businessLogger.info("AUTHORS_VIEWED", {
        event: "AUTHORS_VIEWED",
        count: authors.length,
        authors: authors.map(author => ({
          id: author.id,
          name: author.name
        })),
        endpoint: req.url,
        method: req.method
      });
      res.status(200).json({ authors });
    });
  } catch (error) {
    systemLogger.error("Exception in AuthorsController.get", {
      event: "AUTHORS_GET_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

AuthorsController.prototype.create = async (req, res) => {
  try {
    const { name, birthday, bio } = req.body;
    db.query(
      'INSERT INTO author (name, birthday, bio, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [name, new Date(birthday), bio, new Date(), new Date()],
      (err, result) => {
        if (err) {
          systemLogger.error("Error executing create query in AuthorsController.create", {
            event: "AUTHOR_CREATE_ERROR",
            error: err,
            requestBody: req.body,
            endpoint: req.url,
            method: req.method
          });
          return res.status(500).json({
            message: "Something unexpected has happened. Please try again later."
          });
        }
        db.query(getQuery, (err, authors) => {
          if (err) {
            systemLogger.error("Error executing get query after create in AuthorsController.create", {
              event: "AUTHOR_CREATE_GET_ERROR",
              error: err,
              endpoint: req.url,
              method: req.method
            });
            return res.status(500).json({
              message: "Something unexpected has happened. Please try again later."
            });
          }
          // Log business metric for author creation with detailed info
          businessLogger.info("AUTHOR_CREATED", {
            event: "AUTHOR_CREATED",
            author: {
              id: result.insertId,
              name
            },
            endpoint: req.url,
            method: req.method
          });
          res.status(200).json({
            message: "Author created successfully!",
            authors
          });
        });
      }
    );
  } catch (error) {
    systemLogger.error("Exception in AuthorsController.create", {
      event: "AUTHOR_CREATE_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

AuthorsController.prototype.update = async (req, res) => {
  try {
    const authorId = req.params.id;
    const { name, birthday, bio } = req.body;
    db.query(
      'UPDATE author SET name = ?, birthday = ?, bio = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, new Date(birthday), bio, authorId],
      (err) => {
        if (err) {
          systemLogger.error("Error executing update query in AuthorsController.update", {
            event: "AUTHOR_UPDATE_ERROR",
            error: err,
            authorId,
            requestBody: req.body,
            endpoint: req.url,
            method: req.method
          });
          return res.status(500).json({
            message: "Something unexpected has happened. Please try again later."
          });
        }
        db.query(getQuery, (err, authors) => {
          if (err) {
            systemLogger.error("Error executing get query after update in AuthorsController.update", {
              event: "AUTHOR_UPDATE_GET_ERROR",
              error: err,
              endpoint: req.url,
              method: req.method
            });
            return res.status(500).json({
              message: "Something unexpected has happened. Please try again later."
            });
          }
          // Log detailed business metric for author update
          businessLogger.info("AUTHOR_UPDATED", {
            event: "AUTHOR_UPDATED",
            author: {
              id: authorId,
              name
            },
            endpoint: req.url,
            method: req.method
          });
          res.status(200).json({
            message: "Author updated successfully!",
            authors
          });
        });
      }
    );
  } catch (error) {
    systemLogger.error("Exception in AuthorsController.update", {
      event: "AUTHOR_UPDATE_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

AuthorsController.prototype.delete = async (req, res) => {
  try {
    const authorId = req.params.id;
    db.query('DELETE FROM author WHERE id = ?', [authorId], (err) => {
      if (err) {
        systemLogger.error("Error executing delete query in AuthorsController.delete", {
          event: "AUTHOR_DELETE_ERROR",
          error: err,
          authorId,
          endpoint: req.url,
          method: req.method
        });
        return res.status(500).json({
          message: "Something unexpected has happened. Please try again later."
        });
      }
      db.query(getQuery, (err, authors) => {
        if (err) {
          systemLogger.error("Error executing get query after delete in AuthorsController.delete", {
            event: "AUTHOR_DELETE_GET_ERROR",
            error: err,
            endpoint: req.url,
            method: req.method
          });
          return res.status(500).json({
            message: "Something unexpected has happened. Please try again later."
          });
        }
        // Log business metric for author deletion
        businessLogger.info("AUTHOR_DELETED", {
          event: "AUTHOR_DELETED",
          authorId,
          endpoint: req.url,
          method: req.method
        });
        res.status(200).json({
          message: "Author deleted successfully!",
          authors
        });
      });
    });
  } catch (error) {
    systemLogger.error("Exception in AuthorsController.delete", {
      event: "AUTHOR_DELETE_EXCEPTION",
      error: error,
      endpoint: req.url,
      method: req.method
    });
    res.status(500).json({
      message: "Something unexpected has happened. Please try again later."
    });
  }
};

module.exports = new AuthorsController();