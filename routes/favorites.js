/* eslint-disable camelcase */

'use strict';

const express = require('express');
const boom = require('boom');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const { camelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/favorites', authorize, (req, res, next) => {
  knex('favorites')
    .where('user_id', req.claim.userId)
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .then((rows) => {
      res.send(camelizeKeys(rows));
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/favorites/check', authorize, (req, res, next) => {
  if (!req.query.bookId || isNaN(req.query.bookId)) {
    next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('favorites')
    .where('user_id', req.claim.userId)
    .where('book_id', req.query.bookId)
    .first()
    .then((book) => {
      res.send(book ? true : false); // eslint-disable-line no-unneeded-ternary
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  if (!req.body.bookId || isNaN(req.body.bookId)) {
    next(boom.create(400, 'Book ID must be an integer'));
  }

  knex('books')
    .where('id', req.body.bookId)
    .first()
    .then((row) => {
      if (!row) {
        next(boom.create(404, 'Book not found'));
      }

      return knex('favorites')
      .insert({
        id: req.body.id,
        book_id: req.body.bookId,
        user_id: req.claim.userId
      }, '*');
    })
    .then((books) => {
      const { id, user_id, book_id } = books[0];

      res.send(camelizeKeys({ id, user_id, book_id }));
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  if (!req.body.bookId || isNaN(req.body.bookId)) {
    next(boom.create(400, 'Book ID must be an integer'));
  }

  let book;

  knex('favorites')
    .where('book_id', req.body.bookId)
    .where('user_id', req.claim.userId)
    .first()
    .then((row) => {
      if (!row) {
        next(boom.create(404, 'Favorite not found'));
      }
      book = {
        bookId: row.book_id,
        userId: row.user_id
      };

      return knex('favorites')
        .del()
        .where('book_id', req.body.bookId)
        .where('user_id', req.claim.userId);
    })
    .then(() => {
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});
module.exports = router;
