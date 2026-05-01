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

function getCityDateKey(unixTimestamp, timezoneOffset) {
  return new Date((unixTimestamp + timezoneOffset) * 1000)
    .toISOString()
    .split("T")[0];
}

function getCityWeekday(unixTimestamp, timezoneOffset) {
  return new Date((unixTimestamp + timezoneOffset) * 1000).toLocaleDateString(
    "ro-RO",
    {
      weekday: "long",
      timeZone: "UTC"
    }
  );
}

export default function ForecastList({ data }) {
  const timezoneOffset = data.city.timezone;
  const todayDate = getCityDateKey(data.list[0].dt, timezoneOffset);

  const dailyMap = new Map();

  data.list.forEach((item) => {
    const dayKey = getCityDateKey(item.dt, timezoneOffset);

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        dayName: getCityWeekday(item.dt, timezoneOffset),
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

  const days = Array.from(dailyMap.entries())
    .filter(([date]) => date !== todayDate)
    .slice(0, 5);

  return (
    <section className="card">
      <h3>Următoarele 5 zile</h3>

      <div className="forecast-row">
        {days.map(([date, info]) => {
          const iconUrl = `https://openweathermap.org/img/wn/${info.icon}@2x.png`;

          const tempMaxC = Math.round(info.tempMax);
          const tempMinC = Math.round(info.tempMin);
          const tempMaxF = celsiusToFahrenheit(info.tempMax);
          const tempMinF = celsiusToFahrenheit(info.tempMin);

          const windSpeed = Math.round(info.windSpeed * 3.6);
          const windDir = getWindDirection(info.windDeg);

          return (
            <div className="forecast-card" key={date}>
              <strong>{info.dayName}</strong>
              <img src={iconUrl} alt="iconiță vreme" />
              <p>{info.desc}</p>
              <p>🌡️ Max: {tempMaxC}°C / {tempMaxF}°F</p>
              <p>🌡️ Min: {tempMinC}°C / {tempMinF}°F</p>
              <p>💨 {windSpeed} km/h dinspre {windDir}</p>
              <p>💧 {info.humidity}%</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}