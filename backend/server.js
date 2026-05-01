const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

app.get("/", (req, res) => {
  res.json({
    message: "Backend-ul aplicației meteo funcționează."
  });
});

app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city;

    if (!city) {
      return res.status(400).json({
        message: "Trebuie să introduci un oraș."
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ro`;

    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error("Eroare /api/weather:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: "Nu s-a putut obține prognoza.",
      error: error.response?.data || error.message
    });
  }
});

app.get("/api/weather/coords", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        message: "Latitudinea și longitudinea sunt obligatorii."
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ro`;

    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error("Eroare /api/weather/coords:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: "Nu s-a putut obține prognoza după coordonate.",
      error: error.response?.data || error.message
    });
  }
});

app.get("/api/air", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        message: "Latitudinea și longitudinea sunt obligatorii."
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;

    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error("Eroare /api/air:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: "Nu s-a putut obține calitatea aerului.",
      error: error.response?.data || error.message
    });
  }
});

app.get("/api/cities", async (req, res) => {
  try {
    const query = req.query.query;

    if (!query || query.length < 3) {
      return res.status(400).json({
        message: "Introdu cel puțin 3 litere."
      });
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${OPENWEATHER_API_KEY}`;

    const response = await axios.get(url);

    const cities = response.data.map(city => ({
      name: city.name,
      state: city.state || "",
      country: city.country,
      lat: city.lat,
      lon: city.lon,
      displayName: `${city.name}${city.state ? ", " + city.state : ""}, ${city.country}`
    }));

    res.json(cities);
  } catch (error) {
    console.error("Eroare /api/cities:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: "Nu s-au putut obține sugestiile pentru orașe.",
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});