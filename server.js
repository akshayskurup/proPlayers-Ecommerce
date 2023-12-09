const express = require("express");
const app = express();
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes/router');
const connectDB = require('./model/database');
const nocache = require("nocache");
const crypto = require('crypto');

// Load environment variables from .env
require('dotenv').config();

// Generate a random, secure session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Add nocache middleware
app.use(nocache());

// Set up session middleware
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// Serve static files
app.use(express.static('public'));
app.use('/productimgs', express.static(path.join(__dirname, 'public', 'productimgs')));

// Use routes
app.use('/', routes);


// Set view engine and views
app.set('view engine', 'ejs');
app.set('views', './views');

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server Started"));