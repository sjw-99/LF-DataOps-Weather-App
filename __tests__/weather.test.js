import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data"); // Point to project route and look for data folder
const JSON_FILE = path.join(DATA_DIR, "weather.json"); // Look in data directory for weather.json
const CSV_FILE = path.join(DATA_DIR, "weather_log.csv"); // Look in data directory for weather_log.csv

// Create suite of tests for weather data
describe("Weather Data Tests", () => {
  test("weather.json exists", () => {
    // Check if the JSON_FILE exists
    expect(fs.existsSync(JSON_FILE).toBe(true));
  });

  test("weather.json has required keys", () => {
    const raw = fs.readFileSync(JSON_FILE, "utf8"); // Read JSON_FILE using utf characters
    expect(raw.trim().length).toBeGreaterThan(0); // Trim the whitespace and expect to exist

    const data = JSON.parse(raw); // Converting JSON_FILE to JS object
    expect(data).toHaveProperty("main"); // Expect data to have 'main' property
    expect(data).toHaveProperty("weather"); // Expect data to have 'weather' property
    expect(data.weather[0]).toHaveProperty("description"); // Expect the first value in data to have 'description'
    expect(data).toHaveProperty("_last_updated_utc"); // Expect data to have timestamp

    expect(new Date(data._last_updated_utc).toISOString()).toBe(
      data._last_updated_utc
    ); // Check timestamp matches current timestamp
  });

  test("CSV log exists and has header", () => {
    expect(fs.existsSync(CSV_FILE).toBe(true)); // Check the csv file exists

    const csvContent = fs.readFileSync(CSV_FILE, "utf8"); // Read the csv file
    const lines = csvContent.trim().split("\n"); // Trim the whitespace and split into lines
    const header = lines[0].split(","); // Extract the first line as the header, split into array of values

    expect(header).toEqual(["timestamp", "city", "temperature", "description"]); // Check the header content
    expect(lines.length).toBeGreaterThan(1); // Check there is more than just the header

    const firstDataRow = lines[1].split(","); // Fetch the first data line and split into data points
    expect(!isNaN(parseFloat(firstDataRow[2]))).toBe(true); // Check that the temperature data is a valid number
  });
});
