import fs from "fs"; // Read from and write from files
import path from "path"; // Shows us the path to a file
import dotenv from "dotenv"; // Read environment variables from .env file

dotenv.config();

// Create a data directory to save our data into in the current directory
const DATA_DIR = path.join(import.meta.dirname, "data");

if (!fs.existsSync(DATA_DIR)) {
  // If the data directory doesn't exist
  fs.mkdirSync(DATA_DIR); // Create the data directory
}

const WEATHER_FILE = path.join(DATA_DIR, "weather.json"); // Inside the data directory, create file path to JSON file
const LOG_FILE = path.join(DATA_DIR, "weather_log.csv"); // Inside the data directory, create file path to weather log csv

export async function fetchWeather() {
  const apiKey = process.env.WEATHER_API_KEY; // Keep the API key hidden
  const city = process.env.CITY || "London"; // The city we are tracking data on, or London as default
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const resp = await fetch(url); // Fetch URL
    if (!resp.ok) {
      throw new Error(`HTTP error! Status: ${resp.status}`); // If there is an error, display it
    }
    const data = await resp.json(); // Convert the response into JSON

    const nowUTC = new Date().toISOString(); // Creates a timestamp for when we fetched the data y-m-d h-m-s-tz
    data._last_updated_utc = nowUTC; // Adding a new property to our JSON data with timestamp

    fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2)); // Writing the data object into weather JSON file, formatted as a JSON string. 'Null' and '2' make it readable

    const header = "timestamp,city,temperature,description\n"; // Headers for csv file, new line
    if (!fs.existsSync(LOG_FILE)) {
      // If the log file doesn't exist
      fs.writeFileSync(LOG_FILE, header); // Create file and add header
    } else {
      const firstLine = fs.readFileSync(LOG_FILE, "utf8").split("\n")[0]; // Read csv using utf8, split file into lines, take the first line
      if (firstLine !== "timestamp,city,temperature,description") {
        // Check the headers of the first line
        fs.writeFileSync(LOG_FILE, header + fs.readFileSync(LOG_FILE, "utf8")); // If they aren't there, write them in and read the file again
      }
    }

    const logEntry = `${nowUTC},${city},${data.main.temp},${data.weather[0].description}\n`; // Data point to be added to our csv file each time the API is called
    fs.appendFileSync(LOG_FILE, logEntry); // Append the log entry to our log file

    console.log(`Weather data updated for ${city} at ${nowUTC}.`); // Log update
  } catch (err) {
    console.log("Error fetching weather: ", err); // Display error message if API doesn't work
  }
}

// if (import.meta.url === `file://${process.argv[1]}`) {
//   // Check where file is running from is the same as where the node file is running from
//   fetchWeather(); // Call fetchWeather
// }

fetchWeather();
