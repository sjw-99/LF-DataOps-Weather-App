async function loadWeather() {
  try {
    const res = await fetch("/api/weather"); // Fetch the weather data
    const weather = await res.json(); // Save response as weather JSON object

    document.getElementById("weather").innerHTML = `
        <h2> ${weather.name} </h2>
        <p> Temperature: ${weather.main.temp} Degrees Celsius </p>
        <p> Condition: ${weather.weather[0].description} </p>
    `; // Insert weather data into weather div
  } catch (err) {
    document.getElementById(
      "weather"
    ).innerHTML = `<p> Error: Failed to load weather data </p>`; // Insert error message into weather div
    console.log(err);
  }
}

async function loadChart() {
  try {
    const res = await fetch("/api/weather-log");
    const { timestamps, temps } = await res.json();

    // Create plotly chart based on documentation
    const trace = {
      x: timestamps,
      y: temps,
      type: "scatter",
      mode: "line+markers",
      line: {
        color: "blue",
      },
    };

    // Define plotly layout - title, labels etc
    const layout = {
      title: "Temperature Over Time",
      xaxis: { title: "Data", type: "data" },
      yaxis: { title: "Temperature (C)" },
      legend: { orientation: "h", x: 0, y: 1.1 },
    };

    Plotly.newPlot("chart", [trace], layout); // Create the plot
  } catch (err) {
    console.log("Failed to load chart: ", err);
  }
}

loadWeather();
loadChart();
