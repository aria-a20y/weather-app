import { useState } from "react";

export function useCityValidation() {
  const [error, setError] = useState("");

  function validateCity(city) {
    const value = city.trim();

    if (!value) {
      setError("Introdu un oraș.");
      return false;
    }

    if (value.length < 2) {
      setError("Orașul trebuie să aibă cel puțin 2 caractere.");
      return false;
    }

    setError("");
    return true;
  }

  function clearError() {
    setError("");
  }

  return { error, validateCity, clearError };
}