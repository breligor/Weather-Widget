const apiKey = '8cf3b971dd590b0efab47a08a987c4aa';
const cityName = document.querySelector('.city-name');
const dateBlock = document.querySelector('.date');
const weeklyForecast = document.getElementById('weekForecast');
const btnDetailedWeather = document.querySelector('.detailedWeather');
const btnChangeCityName = document.querySelector('.btn2');
const input = document.querySelector('.input');
const today = new Date();
let latitude;
let longitude;
let max = [];
let min = [];
let myMap;
let options = {
    hour: 'numeric',
    minute: 'numeric',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};

//текущая дата и время
dateBlock.innerHTML = today.toLocaleString('en', options);

//случайная цитата из API
function parseQuote(response) {
    document.getElementById("quote").innerHTML = response.quoteText;
    document.getElementById("author").innerHTML = response.quoteAuthor;
}

//функция для замены имени города при вводе нового
const changeCityName = () => {
    cityName.textContent = input.value;
};

//яндекс карты
ymaps.ready(init);

function init() {
    myMap = new ymaps.Map('map', {
            center: [`${latitude}`, `${longitude}`],
            zoom: 11,
        }
    );
}

// Плавное перемещение центра карты в точку с новыми координатами.
function setTypeAndPan(lat, lon) {
    myMap.panTo([lat, lon], {
        // Задержка между перемещениями.
        delay: 1500
    });
}

// функция для поиска и отображения погоды по введенному городу и показа его на карте
const findMyWeather = () => {
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${input.value}&lang=en&units=metric&appid=${apiKey}`)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (weatherData) {
            changeCityName();
            document.querySelector('.temperature').innerHTML = `${Math.round(weatherData.main.temp)}&deg`;
            document.querySelector('.clouds').innerHTML = weatherData.weather[0]['description'];
            document.querySelector('.img').innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherData.weather[0]['icon']}.png">`;
            document.querySelector('.pressure').innerHTML = `Pressure:  ${weatherData.main.pressure}mBar`;
            document.querySelector('.humidity').innerHTML = `Humidity:  ${weatherData.main.humidity}%`;
            document.querySelector('.feelslike').innerHTML = `Feelslike:  ${Math.round(weatherData.main.feels_like)}&deg`;
            document.querySelector('.wind').innerHTML = `Wind:  ${weatherData.wind.speed}m/s`;
            latitude = weatherData.coord.lat;
            longitude = weatherData.coord.lon;
            setTypeAndPan(latitude, longitude);
        })
        .catch(function () {
            //errors
        });
};

// по кнопке ввода названия города выводим погоду
btnChangeCityName.addEventListener('click', findMyWeather);

// погода на 5 дней
const getWeeklyForecast = (url) => {
    return fetch(url).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            Promise.reject();
        }
    })
};

// геолокация (по дефолту определяет город пользователя и выводит погоду для него и город на карте) + погода на 5 дней
const findMyState = () => {

    const success = (position) => {

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        const geoApiReverse = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=2&appid=${apiKey}`;
        fetch(geoApiReverse)
            .then(res => res.json())
            .then(data => {
                cityName.textContent = data[0].name;
                return data;
            })
            .then(data => {
                fetch(`http://api.openweathermap.org/data/2.5/weather?q=${data[0].name}&lang=en&units=metric&appid=${apiKey}`)
                    .then(function (resp) {
                        return resp.json()
                    })
                    .then(function (weatherData) {
                        document.querySelector('.temperature').innerHTML = `${Math.round(weatherData.main.temp)}&deg`;
                        document.querySelector('.clouds').innerHTML = weatherData.weather[0]['description'];
                        document.querySelector('.img').innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherData.weather[0]['icon']}.png">`;
                        document.querySelector('.pressure').innerHTML = `Pressure:  ${weatherData.main.pressure}mBar`;
                        document.querySelector('.humidity').innerHTML = `Humidity:  ${weatherData.main.humidity}%`;
                        document.querySelector('.feelslike').innerHTML = `Feelslike:  ${Math.round(weatherData.main.feels_like)}&deg`;
                        document.querySelector('.wind').innerHTML = `Wind:  ${weatherData.wind.speed}m/s`;
                    })
                    .catch(function () {
                        //errors
                    });
            });
    };
    const error = () => {
        weeklyForecast.textContent = 'error';
    };
    navigator.geolocation.getCurrentPosition(success, error);
};

//погода на 5 дней
getWeeklyForecast(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName.textContent}&lang=ru_RU&units=metric&appid=${apiKey}`)
    .then((forecast) => {

        const sixPm = forecast.list.filter(f => f.dt_txt.split(" ")[1] === "18:00:00");
        while (forecast.list.length) {

            const dailyForecast = forecast.list.reverse().splice(0, 8);

            let maxTemp = [
                dailyForecast[7].main.temp_max,
                dailyForecast[6].main.temp_max,
                dailyForecast[5].main.temp_max,
                dailyForecast[4].main.temp_max,
                dailyForecast[3].main.temp_max,
                dailyForecast[2].main.temp_max,
                dailyForecast[1].main.temp_max,
                dailyForecast[0].main.temp_max
            ];

            max.push(Math.max(...maxTemp));

            let minTemp = [
                dailyForecast[7].main.temp_min,
                dailyForecast[6].main.temp_min,
                dailyForecast[5].main.temp_min,
                dailyForecast[4].main.temp_min,
                dailyForecast[3].main.temp_min,
                dailyForecast[2].main.temp_min,
                dailyForecast[1].main.temp_min,
                dailyForecast[0].main.temp_min
            ];

            min.push(Math.min(...minTemp));
        }

        sixPm.forEach(day => {
            let date = new Date(day.dt_txt);
            let days = date.toLocaleString("en", {weekday: "long"});
            weeklyForecast.insertAdjacentHTML('beforeend', `
        <div class="day">
        <h3>${days}</h3>
        <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
        <div class="description">${day.weather[0].description}</div>
        <div class="temp">
          <span class="high">${max.pop().toFixed(0)}℃</span>/<span class="low">${min.pop().toFixed(0)}℃</span>
        </div>
      </div>
        `)
        })
    });

findMyState();

//скрытие/показ блока погоды на 5 дней
btnDetailedWeather.onclick = function () {
    weeklyForecast.classList.toggle('hidden')
};





