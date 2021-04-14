const cors = require('cors');
const createError = require('http-errors');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const morgan = require('morgan');

const app = express();

const { NODE_ENV } = process.env;

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());
app.use(cors());

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  return res.status(200).json({ statusCode: 200, message: http.STATUS_CODES[200] });
});

// 404 handler
app.use((req, res, next) => next(createError(404)));

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof createError.HttpError) return res.status(err.status).json(err);

  return res
    .status(500)
    .json(
      createError(
        500,
        process.env.NODE_ENV === 'production' ? http.STATUS_CODES[500] : err.message,
      ),
    );
});

module.exports = app;
