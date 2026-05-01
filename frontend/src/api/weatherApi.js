const API_URL = "https://weather-app-o67m.onrender.com";

async function request(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "A apărut o eroare.");
    }

    return data;
  } catch (error) {
    console.error("Eroare API:", error);
    throw new Error(error.message || "Nu s-a putut face conexiunea cu serverul.");
  }
}

export function getWeatherByCity(city) {
  return request(`/api/weather?city=${encodeURIComponent(city)}`);
}

export function getWeatherByCoords(lat, lon) {
  return request(`/api/weather/coords?lat=${lat}&lon=${lon}`);
}

export function getAirQuality(lat, lon) {
  return request(`/api/air?lat=${lat}&lon=${lon}`);
}

export function getCitySuggestions(query) {
  return request(`/api/cities?query=${encodeURIComponent(query)}`);
}