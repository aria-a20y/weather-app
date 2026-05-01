const API_URL = "http://localhost:5000/api";

async function request(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "A apărut o eroare.");
  }

  return data;
}

export function getWeatherByCity(city) {
  return request(`/weather?city=${encodeURIComponent(city)}`);
}

export function getWeatherByCoords(lat, lon) {
  return request(`/weather/coords?lat=${lat}&lon=${lon}`);
}

export function getAirQuality(lat, lon) {
  return request(`/air?lat=${lat}&lon=${lon}`);
}

export function getCitySuggestions(query) {
  return request(`/cities?query=${encodeURIComponent(query)}`);
}