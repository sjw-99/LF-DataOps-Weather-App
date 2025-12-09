import express from "express";
import fs from "fs";
import path from "path";
import csv from "csv-parser"; // Reads csv files and turns them into JS objects
import dotenv from "dotenv";

dotenv.config();

const app = express(); // Create express application

const PORT = process.env.PORT || 5001;

const DATA_DIR = path.join(import.meta.dirname, "data"); // Create path to data folder
const WEATHER_FILE = path.join(DATA_DIR, "weather.json"); // Create file path to weather.json
const LOG_FILE = path.join(DATA_DIR, "weather_log.csv"); // Create file path to weather_log.csv

app.use(express.static(path.join(import.meta.dirname, "public"))); // Allows user to access file in public directory through browser

//! Route for get request made on the /api/weather endpoint. Show us weather right now
app.get("/api/weather", (req, res) => {
  if (!fs.existsSync(WEATHER_FILE)) {
    return res.status(404).json({ error: "No weather data available." }); // Error if the weather file doesn't exist
  }

  try {
    const weatherData = JSON.parse(fs.readFileSync(WEATHER_FILE, "utf8")); // Get weather file, read it, turn from text into JS object
    res.json(weatherData); // Send object as JSON response to the browser
  } catch (err) {
    console.log("Error reading weather.json: ", err); // Error message if it doesn't work
    res.status(500).json({ error: "Failed to read weather data" }); // Send error status
  }
});

//! Route for get request made on /api/weather-log endpoint. Shows use plot of weather over time
app.get("/api/weather-log", (req, res) => {
  if (!fs.existsSync(LOG_FILE)) {
    return res.status(404).json({ error: "No weather log available" });
  }

  const timestamps = [];
  const temps = [];

  // Check if our Log File has all of the information we need
  fs.createReadStream(LOG_FILE)
    .pipe(csv()) // Open csv file so it can be read line-by-line, use csv-parser to turn each line into object
    .on("data", (row) => {
      // Check timestamp and temperature exists
      if (row.timestamp && row.temperature) {
        timestamps.push(row.timestamp); // Add timestamp to array
        temps.push(parseFloat(row.temperature)); // Add temps as float values to array
      }
    })
    .on("end", () => res.json({ timestamps, temps })) // At the end of the file, return the arrays in an object
    .on("error", (err) => {
      console.log("Error reading CSV: ", err);
      res.status(500).json({ error: "Failed to read log" });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`); // Listens for connections on PORT
});
