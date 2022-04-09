require('dotenv').config();
const express = require('express');
const models = require('./models');
const router = require('./routes/index');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

module.exports = app
