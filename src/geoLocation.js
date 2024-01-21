const express = require('express');
const router = express.Router(); // Create a router
const sql = require('mssql');

const ipinfo = require('ipinfo'); // Import the ipinfo library
const apiKey = '8b750e7046c6db';

const port = process.env.PORT || 3000;

// Function to get location based on IP address
async function getLocation(ip) {
    try {
      const response = await ipinfo(ip, { token: apiKey });
      const { city, region, country, loc } = response;
      return { city, region, country, loc };
    } catch (error) {
      console.error('Error fetching location:', error.message);
      return null;
    }
  }

async function sendDataToAzureSQL(data) {
    const config = {
        user: 'CloudSAce7ce55c',
        password: 'hipop2010!',
        server: 'personalweb.database.windows.net',
        database: 'PersonalWeb',
    };

    try {
        const pool = await sql.connect(config);
        const request = new sql.Request(pool);

        const query = `
            INSERT INTO ViewerGeoData (Page, City, Region, Country, Coordinates, Timestamp)
            VALUES ('${data.pageKey}', '${data.city}', '${data.region}', '${data.country}', '${data.coordinates}', GETDATE())
        `;

        const result = await request.query(query);
        console.log('Data inserted successfully.');
    } catch (error) {
        console.error('Error inserting data into Azure SQL:', error);
    }
}

function extractIPAddress(inputString) {
    // Split the input string by the colon (":")
    const parts = inputString.split(':');

    // The first part (index 0) will be the IP address
    const ipAddress = parts[0];

    return ipAddress;
}

// Define a route to get the user's location
router.get('/get-location/:pageKey', async (req, res) => {
  // Get the value of the additional parameter from the route URL
  const pageKey = req.params.pageKey;
  // Get the user's IP address from the request headers
  const userIpAndPort = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // e.g."98.42.225.197:44934"
  const userIpAddress = extractIPAddress(userIpAndPort)
  console.log("ip", userIpAddress);
  const location = await getLocation(userIpAddress);
  
  if (location) {
      try {
          // Send the location data as JSON response
          res.json(location);

          // Send the location data to Azure SQL Database
          const dataToInsert = {
              pageKey: pageKey,
              city: location.city,
              region: location.region,
              country: location.country,
              coordinates: location.loc,
          };

          await sendDataToAzureSQL(dataToInsert);
      } catch (error) {
          console.error('Error inserting data into Azure SQL:', error);
          res.status(500).json({ error: 'Error inserting data into Azure SQL.' });
      }
  } else {
      console.error('Error fetching location.');
      res.status(500).json({ error: 'Error fetching location.' });
  }
});
  
module.exports = router; // Export the router