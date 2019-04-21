const express = require('express');
const bodyParser = require('body-parser');
const requestPromise = require('request-promise');
const app = express();
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// OpenWeatherAPI Key Not worth Hiding
const openWeatherApiKey= "&APPID=HIDDEN";

// Default Post Route For WebHook // Must be changed in DialogFlow as well.
app.post('/', (req, res) => {
  // saving the action to determine the intent
  let action = req.body["result"].action;
  // city intent check for city parameter
  if(action == "weather-intent-city"){
    // retrieve city parameter from request
    let city = req.body["result"]["parameters"].city;
    // prepare weather API request with City and API KEY
    const options = {
      method: 'GET',
      uri: 'http://api.openweathermap.org/data/2.5/weather?q='+city+openWeatherApiKey
    };
    // call the request promise
    requestPromise(options)
      .then((response) => {
        // save temp and convert it from Kelvin to Celsius : # Rip OpenWeather
        var temp = Math.round(parseFloat(JSON.parse(response)["main"].temp) - 273.15);
        // Get SkyStatus from the API (Cloudy, Rain , Clear ..etc)
        var skyStatus = JSON.parse(response)["weather"][0].description;
        // Get the humidity percentage from the API
        var humidity = JSON.parse(response)["main"].humidity;
        // Prepareing the JSON response to DialogFlow
        var jsonReply = {
          speech : "It's " + skyStatus + " , temp is " + temp + " °C in and the humidity is " + humidity + '% in ' + city
        }
        // Sending The JSON response to DialogFlow
        res.send(jsonReply);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // cord intent check for lat and lng
  else if(action == "weather-intent-cords"){
    // retrieve lat and lng parameters from request.
    var lat = req.body["result"]["parameters"].lat;
    var lng = req.body["result"]["parameters"].lng;
    // prepare weather API request with Cords ! and API KEY
    const options = {
      method: 'GET',
      uri: 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lng + '&' + openWeatherApiKey
    };
    // call the request promise
    requestPromise(options)
      .then((response) => {
        // save temp and convert it from Kelvin to Celsius : # Rip OpenWeather
        var temp = Math.round(parseFloat(JSON.parse(response)["main"].temp) - 273.15);
        // retreiving the city from OpenWeather since The user sent Cordinates only.
        var city = JSON.parse(response).name;
        // Get SkyStatus from the API (Cloudy, Rain , Clear ..etc)
        var skyStatus = JSON.parse(response)["weather"][0].description;
        // Get the humidity percentage from the API
        var humidity = JSON.parse(response)["main"].humidity;
        // Prepareing the JSON response to DialogFlow
        var jsonReply = {
          speech : "It's " + skyStatus + " , temp is " + temp + " °C in and the humidity is " + humidity + '% in ' + city
        }
        // Sending the JSON response to DialogFlow
        res.send(jsonReply);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    // Invalid or Unknown Intent !
    res.send("{ error : 'Invalid Action/Intent'}");
  }
});

// Start Listening (Server)
app.listen(app.get('port'), ()=> {
  console.log("Server is running at port : 3000");
});
