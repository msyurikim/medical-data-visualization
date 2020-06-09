const express = require('express');
//jQuery doesn't work server side?
const axios = require('axios');

const token = require('../config.js').DATA_MEDICARE_GOV_APP_TOKEN;


const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/../client/dist'));

// ----------------------------------------------------
// TODO: Fill in the request handler for this endpoint!
// ----------------------------------------------------
app.get('/api/heartFailures', (req, res) => {
  // ----------------------------------------------------
  // TODO: Fill in the request handler for this endpoint!
  // ----------------------------------------------------

  var statesData = {};
  //use params instead of data for get request
  axios.get( "https://data.medicare.gov/resource/ynj2-r877.json" , {
      params: {
        "$limit" : 5000,
        "$$app_token" : token,
        "measure_name" : "Death rate for heart failure patients",
        "measure_id" : "MORT_30_HF"
      }
    })
    .then( (data) => {
      data = data.data;
      data.filter( (record) => {
        var state = record.state;
        const notUSTerritory = (['AS', 'DC', 'GU', 'MP', 'PR', 'VI']).indexOf(state) === -1;
        if (notUSTerritory && record.score !== "Not Available") {
          if (statesData.hasOwnProperty(state)) {
            statesData[state].totalScore = statesData[state].totalScore + parseFloat(record.score);
            statesData[state].count++;
          } else {
            statesData[state] = {
              'totalScore' : parseFloat(record.score),
              'count' : 1
            };
          }
        }
      });
      Object.keys(statesData).forEach( (state) => {
        // statesData[state].mortalityScore = (statesData[state].totalScore / statesData[state].count).toFixed(1);
        statesData[state].mortalityScore = Math.round(statesData[state].totalScore / statesData[state].count);
        delete statesData[state].totalScore;
        delete statesData[state].count;
      });
      // console.log(statesData);
      res.send(statesData);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
    // -----------------------------------------------------
    // TODO: Send a request to the HospitalCompare API here!
    // -----------------------------------------------------

    // -----------------------------------------------------
    // TODO: Do all data processing/wrangling/munging here!
    // -----------------------------------------------------

});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});