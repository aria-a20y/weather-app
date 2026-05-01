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
  return new Date((unixTimestamp + timezoneOffset) * 1000).toLocaleTimeString(
    "ro-RO",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC"
    }
  );
}

function formatGMT(timezoneOffset) {
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const absOffset = Math.abs(timezoneOffset);
  const hours = Math.floor(absOffset / 3600);
  const minutes = Math.floor((absOffset % 3600) / 60);

  return `GMT${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function CurrentWeatherCard({ data }) {
  const city = data.city.name;
  const today = data.list[0];
  const timezoneOffset = data.city.timezone;

  const tempC = Math.round(today.main.temp);
  const tempF = celsiusToFahrenheit(today.main.temp);

  const desc = today.weather[0].description;
  const icon = today.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  const windSpeed = Math.round(today.wind.speed * 3.6);
  const windDir = getWindDirection(today.wind.deg);
  const humidity = today.main.humidity;

  const sunrise = formatCityTime(data.city.sunrise, timezoneOffset);
  const sunset = formatCityTime(data.city.sunset, timezoneOffset);
  const gmtLabel = formatGMT(timezoneOffset);

  return (
    <section className="card current-card">
      <h2>Prognoză pentru {city}</h2>

      <img src={iconUrl} alt="iconiță vreme" />

      <p className="description">{desc}</p>

      <p>🌡️ {tempC}°C / {tempF}°F</p>
      <p>💨 Vânt: {windSpeed} km/h dinspre {windDir}</p>
      <p>💧 Umiditate: {humidity}%</p>
      <p>🌅 Răsărit: {sunrise}</p>
      <p>🌇 Apus: {sunset}</p>
      <p>🕒 Fus orar oraș: {gmtLabel}</p>
    </section>
  );
}