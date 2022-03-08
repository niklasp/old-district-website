'use strict';

const express = require('express');
const path = require('path');

const app = express();

// Setup view engine
app.use(express.static(path.resolve(path.join(__dirname, '/build'))));

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});