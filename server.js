const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 3000;

const app_id = process.env.APP_ID;
const app_key = process.env.APP_KEY;

app.use(cors());

// Variable to hold the flight data
let flights = []; 

// Function to fetch flight data from the API
const fetchFlightData = async () => {
  try {
    const response = await axios.get('https://api.finavia.fi/flights/public/v0/flights/arr/HEL', {
      headers: {
        'Accept': 'applicatiom/xml',
        'app_id': app_id,  
        'app_key': app_key, 
      },
    });

    xml2js.parseString(response.data, (error, result) => {
      if (error) {
        console.error('Error parsing XML:', error);
        return;
      }

      // Extract necessary flight data
      flights = result.flights.arr[0].body[0].flight.map(flight => ({
        actype: flight.actype[0], // aircraft type
        acreg: flight.acreg[0], // aircraft registration
        landed: flight.prt[0], // landing status
        flightNumber: flight.fltnr[0], // flight number
        flightRoute: flight.route_n_1[0], // route
        estimatedArrival: flight.sdt[0], // estimated arrival time
      }));

      console.log('Flight data updated');
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Set an interval to fetch the data every 2 minutes
setInterval(fetchFlightData, 120000); 

// Endpoint to fetch all arrival flights
app.get('/api/flights', (req, res) => {
  // Return the stored flight data
  res.json({
    flights: flights, // Return the flight data stored in the variable
  });
});

// Initial fetch to populate flight data when the server starts
fetchFlightData();
 
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
