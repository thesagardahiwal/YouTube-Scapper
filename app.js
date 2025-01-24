const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const { youtubeScraper } = require('./scrapper');
const { google } = require('googleapis');
const { error } = require('console');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const API_KEY = process.env.YOUTUBE_API_KEY;

app.use(expressLayouts);
// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle scraping
app.post('/scrape', async (req, res) => {
    const url = req.body.url;
    try {
        const data = await youtubeScraper(API_KEY, url, google);
        if (data.error) {
            return res.render('result', { error: data.error });
        }
        res.render('result', { error: null, data });
    } catch (error) {
        res.render('result', { error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});