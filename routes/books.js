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

router.use('/books/:id', (req, res, next) => {
  if (isNaN(req.params.id) || req.params.id < 0) {
    return res.sendStatus(404);
  }

  next();
});

router.get('/books/:id', (req, res, next) => {
  knex('books')
    .where('id', req.params.id)
    .first()
  .then((book) => {
    if (!book) {
      return next();
    }
    res.send(camelizeKeys(book));
  })
  .catch((err) => {
    next(err);
  });
});

router.post('/books', (req, res, next) => {
  const missing = function(part) {
    const err = new Error(`${part} must not be blank`);

    err.output = { statusCode: 400 };

    return next(err);
  };

  if (!('title' in req.body)) {
    missing('Title');
  }
  if (!('author' in req.body)) {
    missing('Author');
  }
  if (!('genre' in req.body)) {
    missing('Genre');
  }
  if (!('description' in req.body)) {
    missing('Description');
  }
  if (!('coverUrl' in req.body)) {
    missing('Cover URL');
  }

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
        const err = new Error('Not Found');

        err.output = { statusCode: 404 };

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
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        const err = new Error('Not Found');

        err.output = { statusCode: 404 };

        throw err;
      }

      return knex('books')
        .del('*')
        .where('id', req.params.id);
    })
    .then((books) => {
      delete books[0].id;
      res.send(camelizeKeys(books[0]));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
