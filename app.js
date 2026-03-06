// WeatherApp Constructor
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Store DOM references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    // Call init to set things up
    this.init();
}

// Init method
WeatherApp.prototype.init = function () {
    // Add click event listener to search button
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    // Add keypress event listener to input
    this.cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            this.handleSearch();
        }
    }.bind(this));

    // Display welcome message
    this.showWelcome();
};

// Show welcome message
WeatherApp.prototype.showWelcome = function () {
    const welcomeHTML = `
        <div class="welcome-message">
            <p class="loading">Enter a city to get weather information</p>
        </div>
    `;
    this.weatherDisplay.innerHTML = welcomeHTML;
};

// Handle search
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name");
        return;
    }

    this.getWeather(city);
};

// Get forecast data
WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

// Get current weather and forecast
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        console.log("Current Weather Data:", currentWeather.data);
        console.log("Forecast Data:", forecastData);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error("Error:", error);
        if (error.response && error.response.status === 404) {
            this.showError("City not found. Please check spelling.");
        } else {
            this.showError("Something went wrong. Please try again.");
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
    }
};

// Process forecast data to get one entry per day (at 12:00:00)
WeatherApp.prototype.processForecastData = function (data) {
    const dailyForecasts = data.list.filter(function (item) {
        return item.dt_txt.includes('12:00:00');
    });

    return dailyForecasts.slice(0, 5);
};

// Display current weather
WeatherApp.prototype.displayWeather = function (data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = weatherHTML;
    this.cityInput.value = '';
    this.cityInput.focus();
};

// Display forecast
WeatherApp.prototype.displayForecast = function (data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function (day) {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4 class="forecast-day">${dayName}</h4>
                <img src="${iconUrl}" alt="${description}" class="weather-icon">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    }).join('');

    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    this.weatherDisplay.innerHTML += forecastSection;
};

// Show loading
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading">Loading weather...</p>
        </div>
    `;
};

// Show error
WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            ⚠️ ${message}
        </div>
    `;
};

// Create an instance of WeatherApp
const app = new WeatherApp('7a4a5a8f43591f048e3f25f7cfc18885');
