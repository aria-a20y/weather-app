export default function SavedCities({ cities, onCityClick, onReset }) {
  const frequentCities = Object.entries(cities).filter(([, count]) => count >= 3);

  return (
    <section className="card">
      <h3>Orașe salvate</h3>

      {frequentCities.length === 0 ? (
        <p className="muted">Niciun oraș salvat.</p>
      ) : (
        <div className="saved-cities">
          {frequentCities.map(([city]) => (
            <button key={city} onClick={() => onCityClick(city)}>
              {city}
            </button>
          ))}
        </div>
      )}

      <button className="reset-button" onClick={onReset}>
        Resetare orașe
      </button>
    </section>
  );
}