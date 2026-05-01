function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

export default function HourlyForecast({ data }) {
  const hourlyItems = data.list.slice(0, 8);

  return (
    <section className="card">
      <h3>Prognoza pe ore</h3>

      <div className="hourly-row">
        {hourlyItems.map((item) => {
          const hour = item.dt_txt.split(" ")[1].slice(0, 5);
          const tempC = Math.round(item.main.temp);
          const tempF = celsiusToFahrenheit(item.main.temp);
          const desc = item.weather[0].description;
          const icon = item.weather[0].icon;
          const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

          return (
            <div className="hour-card" key={item.dt}>
              <strong>{hour}</strong>
              <img src={iconUrl} alt="iconiță vreme" />
              <p>{desc}</p>
              <p>🌡️ {tempC}°C / {tempF}°F</p>
              <p>💧 {item.main.humidity}%</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}