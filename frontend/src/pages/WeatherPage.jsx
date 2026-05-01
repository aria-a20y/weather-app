import { useEffect, useState } from "react";
import {
  getWeatherByCity,
  getWeatherByCoords,
  getAirQuality,
  getCitySuggestions
} from "../api/weatherApi";

function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

function getWindDirection(deg) {
  const directions = [
    "Nord",
    "Nord-Est",
    "Est",
    "Sud-Est",
    "Sud",
    "Sud-Vest",
    "Vest",
    "Nord-Vest"
  ];

  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function formatCityTime(unixTimestamp, timezoneOffset) {
  return new Date((unixTimestamp + timezoneOffset) * 1000)
    .toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC"
    });
}

function formatGMT(timezoneOffset) {
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const absOffset = Math.abs(timezoneOffset);

  const hours = Math.floor(absOffset / 3600);
  const minutes = Math.floor((absOffset % 3600) / 60);

  return `GMT${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getWeatherBackground(desc) {
  if (!desc) return "/weather-images/default.jpg";

  desc = desc.toLowerCase();

  const snowWords = ["ninsoare", "zăpadă", "viscol", "fulgi", "snow"];
  const rainWords = ["ploaie", "averse", "burniță", "torențial", "rain", "drizzle"];
  const fogWords = ["ceață", "vizibilitate redusă", "nor dens", "fog", "mist", "haze"];
  const sunWords = ["soare", "senin", "cer senin", "parțial însorit", "clear"];
  const stormWords = ["furtună", "descărcări electrice", "tunete", "fulgere", "thunderstorm"];
  const cloudWords = [
    "noros",
    "înnorat",
    "cer acoperit",
    "nori",
    "nori împrăștiați",
    "cer fragmentat",
    "cloud"
  ];

  if (snowWords.some(word => desc.includes(word))) {
    return "/weather-images/snow.jpg";
  }

  if (rainWords.some(word => desc.includes(word))) {
    return "/weather-images/rainy.jpg";
  }

  if (fogWords.some(word => desc.includes(word))) {
    return "/weather-images/fog.jpg";
  }

  if (stormWords.some(word => desc.includes(word))) {
    return "/weather-images/storm.jpg";
  }

  if (sunWords.some(word => desc.includes(word))) {
    return "/weather-images/sunny.jpg";
  }

  if (cloudWords.some(word => desc.includes(word))) {
    return "/weather-images/cloudy.jpg";
  }

  return "/weather-images/default.jpg";
}

function getWeatherMessage(desc) {
  if (!desc) {
    return "Verifică prognoza detaliată pentru mai multe informații.";
  }

  desc = desc.toLowerCase();

  if (desc.includes("senin") || desc.includes("clear")) {
    return "☀️ Zi perfectă pentru plimbări!";
  }

  if (
    desc.includes("furtună") ||
    desc.includes("descărcări electrice") ||
    desc.includes("thunderstorm")
  ) {
    return "⛈️ Stai în siguranță!";
  }

  if (
    desc.includes("ninsoare") ||
    desc.includes("zăpadă") ||
    desc.includes("snow")
  ) {
    return "Ia-ți haine groase și ai grijă la drum! ❄️";
  }

  if (
    desc.includes("ploaie") ||
    desc.includes("averse") ||
    desc.includes("rain") ||
    desc.includes("drizzle")
  ) {
    return "Nu uita umbrela! ☔";
  }

  if (
    desc.includes("ceață") ||
    desc.includes("fog") ||
    desc.includes("mist") ||
    desc.includes("haze")
  ) {
    return "Vizibilitate redusă – circulă cu atenție. 🌫️";
  }

  if (
    desc.includes("nori") ||
    desc.includes("noros") ||
    desc.includes("înnorat") ||
    desc.includes("cer acoperit") ||
    desc.includes("cloud")
  ) {
    return "Cerul este înnorat, dar vremea poate fi potrivită pentru activități ușoare.";
  }

  return "Verifică prognoza detaliată pentru mai multe informații.";
}

export default function WeatherPage() {
  const [city, setCity] = useState("");
  const [displayCity, setDisplayCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [weatherData, setWeatherData] = useState(null);
  const [airData, setAirData] = useState(null);

  const [savedCities, setSavedCities] = useState(() => {
    return JSON.parse(localStorage.getItem("cities")) || {};
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocația nu este disponibilă. Introdu manual orașul.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        loadWeatherByCoords(lat, lon);
      },
      () => {
        setError("Nu s-a putut detecta locația. Introdu manual orașul.");
      }
    );
  }, []);

  useEffect(() => {
    const cityValue = city.trim();

    if (cityValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      getCitySuggestions(cityValue)
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]));
    }, 400);

    return () => clearTimeout(timer);
  }, [city]);

  async function loadWeatherByCoords(lat, lon) {
    try {
      setLoading(true);
      setError("");

      const weather = await getWeatherByCoords(lat, lon);
      const air = await getAirQuality(lat, lon);

      setWeatherData(weather);
      setAirData(air);
      setDisplayCity(weather.city.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();

    const cityValue = city.trim();

    if (!cityValue) {
      setError("Introdu un oraș.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuggestions([]);

      const weather = await getWeatherByCity(cityValue);
      const air = await getAirQuality(
        weather.city.coord.lat,
        weather.city.coord.lon
      );

      setWeatherData(weather);
      setAirData(air);
      setDisplayCity(cityValue);

      saveCity(cityValue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectSuggestion(suggestion) {
    try {
      setCity(suggestion.displayName);
      setDisplayCity(suggestion.displayName);
      setSuggestions([]);
      setLoading(true);
      setError("");

      const weather = await getWeatherByCoords(suggestion.lat, suggestion.lon);
      const air = await getAirQuality(suggestion.lat, suggestion.lon);

      setWeatherData(weather);
      setAirData(air);

      saveCity(suggestion.displayName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function saveCity(cityName) {
    const updatedCities = {
      ...savedCities,
      [cityName]: (savedCities[cityName] || 0) + 1
    };

    localStorage.setItem("cities", JSON.stringify(updatedCities));
    setSavedCities(updatedCities);
  }

  function resetSavedCities() {
    localStorage.removeItem("cities");
    setSavedCities({});
  }

  async function searchSavedCity(cityName) {
    try {
      setCity(cityName);
      setDisplayCity(cityName);
      setLoading(true);
      setError("");
      setSuggestions([]);

      const weather = await getWeatherByCity(cityName);
      const air = await getAirQuality(
        weather.city.coord.lat,
        weather.city.coord.lon
      );

      setWeatherData(weather);
      setAirData(air);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getDailyForecast(data) {
    const timezoneOffset = data.city.timezone;
    const dailyMap = new Map();

    data.list.forEach(item => {
      const date = new Date((item.dt + timezoneOffset) * 1000);
      const dayKey = date.toISOString().split("T")[0];

      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          dayName: date.toLocaleDateString("ro-RO", {
            weekday: "long",
            timeZone: "UTC"
          }),
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          icon: item.weather[0].icon,
          desc: item.weather[0].description,
          windSpeed: item.wind.speed,
          windDeg: item.wind.deg,
          humidity: item.main.humidity
        });
      } else {
        const existing = dailyMap.get(dayKey);

        existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
        existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
      }
    });

    return Array.from(dailyMap.values()).slice(0, 5);
  }

  const frequentCities = Object.entries(savedCities).filter(
    ([, count]) => count >= 3
  );

  const today = weatherData?.list?.[0] || null;
  const timezoneOffset = weatherData?.city?.timezone || 0;
  const airComponents = airData?.list?.[0]?.components || null;

  const backgroundImage = today
    ? getWeatherBackground(today.weather[0].description)
    : "/weather-images/default.jpg";

  return (
    <div
      className="page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <header className="header">
        <h1>Vremea în orașul tău</h1>
        <p>Detectăm automat vremea în locația ta sau poți căuta un oraș.</p>
      </header>

      <main className="main">
        <form className="search-form" onSubmit={handleSearch}>
          <label htmlFor="cityInput">Oraș:</label>

          <div className="search-wrapper">
            <div className="search-row">
              <input
                id="cityInput"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Introdu cel puțin 3 litere"
                autoComplete="off"
              />

              <button type="submit">Află vremea</button>
            </div>

            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map(suggestion => (
                  <li
                    key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}`}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion.displayName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {loading && <p className="loading">Se încarcă vremea...</p>}

        {error && <p className="error-box">⚠ {error}</p>}

        {weatherData && today && !loading && (
          <>
            <section className="card current-card">
              <h2>Prognoză pentru {displayCity || weatherData.city.name}</h2>

              <div className="current-weather-layout">
                <div className="weather-main-info">
                  <img
                    className="weather-icon"
                    src={`https://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png`}
                    alt="iconiță vreme"
                  />

                  <p className="description">{today.weather[0].description}</p>

                  <p className="weather-message">
                    {getWeatherMessage(today.weather[0].description)}
                  </p>

                  <div className="temperature-main">
                    {Math.round(today.main.temp)}°C
                  </div>

                  <p className="temperature-secondary">
                    {celsiusToFahrenheit(today.main.temp)}°F
                  </p>
                </div>

                <div className="weather-details-grid">
                  <div className="detail-box">
                    <span className="detail-icon">💨</span>
                    <span className="detail-label">Vânt: </span>
                    <strong>
                      {Math.round(today.wind.speed * 3.6)} km/h
                    </strong>
                    <strong>{getWindDirection(today.wind.deg)}</strong>
                  </div>

                  <div className="detail-box">
                    <span className="detail-icon">💧</span>
                    <span className="detail-label">Umiditate: </span>
                    <strong>{today.main.humidity}%</strong>
                  </div>

                  <div className="detail-box">
                    <span className="detail-icon">🌅 </span>
                    <span className="detail-label">Răsărit: </span>
                    <strong>
                      {formatCityTime(weatherData.city.sunrise, timezoneOffset)}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span className="detail-icon">🌇 </span>
                    <span className="detail-label">Apus: </span>
                    <strong>
                      {formatCityTime(weatherData.city.sunset, timezoneOffset)}
                    </strong>
                  </div>

                  <div className="detail-box full-width">
                    <span className="detail-icon">🕒 </span>
                    <span className="detail-label">Fus orar: </span>
                    <strong>{formatGMT(timezoneOffset)}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <h3>Prognoza pe ore</h3>

              <div className="hourly-row">
                {weatherData.list.slice(0, 8).map(item => (
                  <div className="hour-card" key={item.dt}>
                    <strong>{item.dt_txt.split(" ")[1].slice(0, 5)}</strong>

                    <img
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                      alt="iconiță vreme"
                    />

                    <p>{item.weather[0].description}</p>

                    <p>
                      🌡️ {Math.round(item.main.temp)}°C /{" "}
                      {celsiusToFahrenheit(item.main.temp)}°F
                    </p>

                    <p>💧 {item.main.humidity}%</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <h3>Prognoză pe 5 zile</h3>

              <div className="forecast-row">
                {getDailyForecast(weatherData).map(item => (
                  <div className="forecast-card" key={item.dayName}>
                    <strong>{item.dayName}</strong>

                    <img
                      src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                      alt="iconiță vreme"
                    />

                    <p>{item.desc}</p>

                    <p>
                      🌡️ Max: {Math.round(item.tempMax)}°C /{" "}
                      {celsiusToFahrenheit(item.tempMax)}°F
                    </p>

                    <p>
                      🌡️ Min: {Math.round(item.tempMin)}°C /{" "}
                      {celsiusToFahrenheit(item.tempMin)}°F
                    </p>

                    <p>
                      💨 {Math.round(item.windSpeed * 3.6)} km/h dinspre{" "}
                      {getWindDirection(item.windDeg)}
                    </p>

                    <p>💧 {item.humidity}%</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {airComponents && !loading && (
          <section className="card">
            <h3>Calitatea aerului</h3>

            <div className="air-block">
              <p>PM2.5: {airComponents.pm2_5} µg/m³</p>
              <p>PM10: {airComponents.pm10} µg/m³</p>
              <p>CO: {airComponents.co} µg/m³</p>
            </div>
          </section>
        )}

        <section className="card">
          <h3>Orașe salvate</h3>

          {frequentCities.length === 0 ? (
            <p className="muted">Niciun oraș salvat.</p>
          ) : (
            <div className="saved-cities">
              {frequentCities.map(([savedCity]) => (
                <button
                  key={savedCity}
                  onClick={() => searchSavedCity(savedCity)}
                >
                  {savedCity}
                </button>
              ))}
            </div>
          )}

          <button className="reset-button" onClick={resetSavedCities}>
            Resetare orașe
          </button>
        </section>
      </main>
    </div>
  );
}