const express = require('express');
const app = express();
const path = require('path');

const myGeolocation = require('./geoLocation'); // Import the geoLocation.js file

const port = process.env.PORT || 3000;

// Use the functionality from myGeolocation.js by including it as middleware
app.use(myGeolocation);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Use the '/get-location' route from myGeolocation.js
app.use('/get-location', myGeolocation);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});