const express = require('express');
const app = express();
const path = require('path');

const viewerGeoLocation = require('./veiwerGeoLocation'); // Import the viewerGeoLocation.js file

const port = process.env.PORT || 3000;

// Use the functionality from viewerGeoLocation.js by including it as middleware
app.use(viewerGeoLocation);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Use the '/get-viewer-location' route from viewerGeoLocation.js
app.use('/get-viewer-location', viewerGeoLocation);

// Use the '/get-viewer-locations' route from viewerGeoLocation.js
app.use('/get-viewer-locations', viewerGeoLocation);

// Use the '/get-viewer-statistics' route from viewerGeoLocation.js
app.use('/get-viewer-statistics', viewerGeoLocation);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});