const express = require('express');
const router = express.Router(); // Create a router
const sql = require('mssql');

const ipinfo = require('ipinfo'); // Import the ipinfo library
const apiKey = '8b750e7046c6db';

const port = process.env.PORT || 3000;

const config = {
    user: 'CloudSAce7ce55c',
    password: 'hipop2010!',
    server: 'personalweb.database.windows.net',
    database: 'PersonalWeb',
    options: {
        encrypt: true
    }
};

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
router.get('/get-viewer-location/:pageKey', async (req, res) => {
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

router.get('/get-viewer-locations', async (req, res) => {
    try {
        await sql.connect(config);

        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Calculate 3 months ago date
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const formattedThreeMonthsAgo = threeMonthsAgo.toISOString().split('T')[0];

        // Create request with parameters
        const request = new sql.Request();
        request.input('threeMonthsAgo', sql.Date, formattedThreeMonthsAgo);
        request.input('limit', sql.Int, limit);
        request.input('offset', sql.Int, offset);

        // Get total count for pagination metadata
        const countQuery = `
            SELECT COUNT(*) as TotalCount
            FROM ViewerGeoData
            WHERE Timestamp >= @threeMonthsAgo
        `;
        const countResult = await request.query(countQuery);
        const totalCount = countResult.recordset[0].TotalCount;

        // Get paginated data with recent visitors first
        const dataQuery = `
            SELECT Page, City, Region, Country, Coordinates, Timestamp
            FROM ViewerGeoData
            WHERE Timestamp >= @threeMonthsAgo
            ORDER BY Timestamp DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        const result = await request.query(dataQuery);

        const locations = result.recordset.map(record => {
            const [latitude, longitude] = record.Coordinates.split(',');
            return {
                page: record.Page,
                city: record.City,
                region: record.Region,
                country: record.Country,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                timestamp: record.Timestamp
            };
        });

        // Return paginated response with metadata
        res.json({
            data: locations,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/get-viewer-statistics', async (req, res) => {
    try {
        await sql.connect(config);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const formattedSixMonthsAgo = sixMonthsAgo.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

        // Use sql.Request to handle the query and parameters
        const request = new sql.Request();
        request.input('sixMonthsAgo', sql.Date, formattedSixMonthsAgo);

        const monthlyCountQuery = `
            SELECT 
                FORMAT(Timestamp, 'yyyy-MM') as MonthYear, COUNT(*) as ViewerCount
            FROM 
                ViewerGeoData
            WHERE 
                Timestamp >= @sixMonthsAgo
            GROUP BY 
                FORMAT(Timestamp, 'yyyy-MM')
            ORDER BY 
                MonthYear
        `;

        const monthlyCountResult = await request.query(monthlyCountQuery);
        
        const totalQuery = `
            SELECT 
                COUNT(*) as TotalCount
            FROM 
                ViewerGeoData
        `;
        const totalResult = await request.query(totalQuery);

        res.json({
            monthlyCounts: monthlyCountResult.recordset,
            overallTotal: totalResult.recordset[0].TotalCount
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
  
module.exports = router;