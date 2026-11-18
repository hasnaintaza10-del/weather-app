const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherCard = document.getElementById("weather-card");
const errorMsg = document.getElementById("error-msg");

const cityName = document.getElementById("city-name");
const temp = document.getElementById("temp");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const icon = document.getElementById("icon");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  if (city === "") return;

  // UI reset
  errorMsg.classList.add("hidden");
  weatherCard.classList.add("hidden");

  try {
    // 1. City ka naam se Latitude/Longitude nikalna (Open-Meteo Geocoding API - No Key)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;
    const exactName = geoData.results[0].name;
    const country = geoData.results[0].country_code;

    // 2. Latitude/Longitude se Weather lana (Open-Meteo Weather API - No Key)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const current = weatherData.current;

    // 3. UI Update karna
    cityName.innerText = `${exactName}, ${country}`;
    temp.innerText = `${Math.round(current.temperature_2m)}°C`;
    humidity.innerText = `${current.relative_humidity_2m}%`;
    wind.innerText = `${Math.round(current.wind_speed_10m)} km/h`;

    // 4. Weather Code ko Text aur Emoji mein badalna
    const weatherInfo = getWeatherInfo(current.weather_code);
    description.innerText = weatherInfo.text;
    icon.innerText = weatherInfo.emoji;

    weatherCard.classList.remove("hidden");
    
  } catch (error) {
    errorMsg.classList.remove("hidden");
  }
}

// WMO Weather Code ko Emoji aur Description mein convert karne ka function
function getWeatherInfo(code) {
  const codes = {
    0: { text: "Clear Sky", emoji: "☀️" },
    1: { text: "Mainly Clear", emoji: "🌤️" },
    2: { text: "Partly Cloudy", emoji: "⛅" },
    3: { text: "Overcast", emoji: "☁️" },
    45: { text: "Fog", emoji: "🌫️" },
    48: { text: "Depositing Rime Fog", emoji: "🌫️" },
    51: { text: "Light Drizzle", emoji: "🌦️" },
    53: { text: "Moderate Drizzle", emoji: "🌦️" },
    55: { text: "Dense Drizzle", emoji: "🌧️" },
    61: { text: "Slight Rain", emoji: "🌧️" },
    63: { text: "Moderate Rain", emoji: "🌧️" },
    65: { text: "Heavy Rain", emoji: "🌧️" },
    71: { text: "Slight Snow", emoji: "🌨️" },
    73: { text: "Moderate Snow", emoji: "🌨️" },
    75: { text: "Heavy Snow", emoji: "❄️" },
    80: { text: "Rain Showers", emoji: "🌦️" },
    81: { text: "Moderate Showers", emoji: "🌧️" },
    82: { text: "Violent Showers", emoji: "⛈️" },
    95: { text: "Thunderstorm", emoji: "⛈️" },
    96: { text: "Thunderstorm with Hail", emoji: "⛈️" },
  };

  return codes[code] || { text: "Unknown Weather", emoji: "❓" };
}