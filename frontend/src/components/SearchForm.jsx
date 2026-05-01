import { useState } from "react";

export default function SearchForm({ onSearch, error }) {
  const [city, setCity] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(city);
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <label htmlFor="cityInput">Oraș:</label>

      <div className="search-row">
        <input
          id="cityInput"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Introdu orașul"
        />

        <button type="submit">Află vremea</button>
      </div>

      {error && <p className="error-text">⚠ {error}</p>}
    </form>
  );
}