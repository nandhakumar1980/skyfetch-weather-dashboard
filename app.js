// Your OpenWeatherMap API Key
const API_KEY = '7a4a5a8f43591f048e3f25f7cfc18885';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Function to fetch weather data
async function getWeather(city) {

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    showLoading();

    try {

        const response = await axios.get(url);

        console.log("Weather Data:", response.data);

        displayWeather(response.data);

    } catch (error) {

        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            showError("City not found. Please check spelling.");
        } else {
            showError("Something went wrong. Please try again.");
        }

    }
}

// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;
}

// Call the function when page loads
function showLoading() {

    document.getElementById("weather-display").innerHTML = `
        <div>
            <div class="spinner"></div>
            <p class="loading">Loading weather...</p>
        </div>
    `;

}
function showError(message) {

    document.getElementById("weather-display").innerHTML = `
        <div class="error-message">
            ⚠️ ${message}
        </div>
    `;

}
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name");
        return;
    }

    getWeather(city);

});
document.getElementById("weather-display").innerHTML =
    "<p class='loading'>Enter a city to get weather information</p>";
