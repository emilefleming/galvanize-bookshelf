/* eslint-disable camelcase */
'use strict';

const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const express = require('express');

// eslint-disable-next-line no-unused-vars
const { camelizeKeys, decamelizeKeys } = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/users', (req, _res, next) => {
  const badReq = function(message) {
    const err = new Error(message);

    err.output = { statusCode: 400 };

    return next(err);
  };

  if (!req.body.email) {
    badReq('Email must not be blank');
  }
  if (!req.body.password || req.body.password.length < 8) {
    badReq('Password must be at least 8 characters long');
  }
  knex('users')
    .where('email', req.body.email)
    .first()
    .then((user) => {
      if (user) {
        badReq('Email already exists');
      }
      else {
        next();
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/users', (req, res, next) => {
  bcrypt.hash(req.body.password, 12)
    .then((hashed_password) => {
      return knex('users')
        .insert({
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: req.body.email,
          hashed_password
        }, '*');
    })
    .then((users) => {
      delete users[0].hashed_password;
      res.send(camelizeKeys(users[0]));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
