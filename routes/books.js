'use strict';

const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps'); // eslint-disable-line no-unused-vars, max-len

router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title')
  .then((books) => {
    res.send(camelizeKeys(books));
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/books/:id', (req, res, next) => {
  knex('books')
    .where('id', req.params.id)
    .first()
  .then((book) => {
    res.send(camelizeKeys(book));
  })
  .catch((err) => {
    next(err);
  });
});

router.post('/books', (req, res, next) => {
  knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl // eslint-disable-line camelcase
    }, '*')
  .then((book) => {
    res.send(camelizeKeys(book[0]));
  })
  .catch((err) => {
    next(err);
  });
});

router.patch('/books/:id', (req, res, next) => {
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        const err = new Error('book not found');

        err.statusCode = 400;

        throw err;
      }

      return knex('books')
        .update({
          title: req.body.title,
          author: req.body.author,
          genre: req.body.genre,
          description: req.body.description,
          cover_url: req.body.coverUrl // eslint-disable-line camelcase
        }, '*')
        .where('id', req.params.id);
    })
  .then((books) => {
    res.send(camelizeKeys(books[0]));
  })
  .catch((err) => {
    next(err);
  });
});

router.delete('/books/:id', (req, res, next) => {
  knex('books')
    .del('*')
    .where('id', req.params.id)
    .then((row) => {
      if (!row) {
        return next();
      }

      const book = row[0];

      delete book.id;
      res.send(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
