function getAirQualityLevel(value, type) {
  if (type === "pm25") {
    if (value <= 12) return { level: "Bun", className: "good" };
    if (value <= 35) return { level: "Moderat", className: "moderate" };
    if (value <= 55) return { level: "Nesănătos", className: "unhealthy" };
    return { level: "Periculos", className: "danger" };
  }

  if (type === "pm10") {
    if (value <= 20) return { level: "Bun", className: "good" };
    if (value <= 50) return { level: "Moderat", className: "moderate" };
    if (value <= 100) return { level: "Nesănătos", className: "unhealthy" };
    return { level: "Periculos", className: "danger" };
  }

  if (type === "co") {
    if (value <= 4000) return { level: "Bun", className: "good" };
    if (value <= 9000) return { level: "Moderat", className: "moderate" };
    return { level: "Periculos", className: "danger" };
  }

  return { level: "Necunoscut", className: "unknown" };
}

export default function AirQualityCard({ data }) {
  const components = data.list[0].components;

  const pm25 = components.pm2_5;
  const pm10 = components.pm10;
  const co = components.co;

  const pm25Level = getAirQualityLevel(pm25, "pm25");
  const pm10Level = getAirQualityLevel(pm10, "pm10");
  const coLevel = getAirQualityLevel(co, "co");

  return (
    <section className="card">
      <h3>Calitatea aerului</h3>

      <p className={pm25Level.className}>
        PM2.5: {pm25} µg/m³ — {pm25Level.level}
      </p>

      <p className={pm10Level.className}>
        PM10: {pm10} µg/m³ — {pm10Level.level}
      </p>

      <p className={coLevel.className}>
        CO: {co} µg/m³ — {coLevel.level}
      </p>
    </section>
  );
}