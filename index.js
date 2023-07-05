require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');
const dns = require('dns');
const url = require('url');

// Basic configuration
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(errorHandler());
app.use(express.static('public'));

// Set up MongoDB database, schema and model
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Url = require('./models/url');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Get an url and redirect to it
app.get('/api/shorturl/:short_url', async (req, res, next) => {
  try {
    const url = await Url.findOne({short_url: req.params.short_url});
    res.redirect(url.original_url);
  } catch (err) {
    next(err);
  }
});

// Create a new url document in the database
app.post('/api/shorturl', (req, res, next) => {
  const url = req.body.url;
  let hostname;
  // Checks for a valid URL
  try {
    hostname = new URL(url).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
  // Checks that the hostname exists
  dns.lookup(hostname, async (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      const newUrl = new Url({
        original_url: url
      });
      try {
        await newUrl.save();
        const savedUrl = await Url.findOne({ original_url: url });
        res.json({
          original_url: savedUrl.original_url,
          short_url: savedUrl.short_url
        });
      } catch (err) {
        next(err);
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});