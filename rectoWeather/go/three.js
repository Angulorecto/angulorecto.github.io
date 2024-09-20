let lat, lon, shortDesc, currentHour;
let skyPack = false;
let forecastInterval;

function sky() {
  if (skyPack == false) {
    if (shortDesc == "Isolated Showers And Thunderstorms") {
      generateSky(25, 0.002, '#8D95AD', '#6E738E', 0x404040, 0.7, 7, false);
    } else if (shortDesc == "Scattered Showers And Thunderstorms") {
      generateSky(20, 0.001, '#8D95AD', '#6E738E', 0x808080, 0.7, 7, false);
    } else if (shortDesc == "Chance Showers And Thunderstorms") {
      generateSky(15, 0.000, '#87CEEB', '#1E90FF', 0xCCCCCC, 1, 4, false);
    } else if (shortDesc == "Partly Sunny") {
      generateSky(7, 0.000, '#8D95AD', '#6E738E', 0xFFFFFF, 1, 2, true);
    } else if (shortDesc == "Partly Cloudy") {
      generateSky(2, 0.000, '#56CDF7', '#0091F6', 0xFFFFFF, 1, 1.5, true);
    } else if (shortDesc == "Mostly Sunny") {
      generateSky(2, 0.000, '#56CDF7', '#0091F6', 0xFFFFFF, 1, 2, true);
    } else if (shortDesc == "Mostly Clear") {
      generateSky(1, 0.000, '#56CDF7', '#0091F6', 0xFFFFFF, 1, 1, true);
    } else if (shortDesc == "Sunny") {
      generateSky(0, 0.000, '#56CDF7', '#0091F6', 0xFFFFFF, 1, 1, true);
    }
  }
}

function generateSky(cloudsCount, lightningRate, bg1, bg2, tint, opacity, windFactor, needSun) {
    let sun;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, bg1);
    gradient.addColorStop(1, bg2);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    const backgroundTexture = new THREE.CanvasTexture(canvas);
    scene.background = backgroundTexture;
    if (needSun == true) {
        const sunGeometry = new THREE.CircleGeometry(3, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.renderOrder = -1;
  
        // Position the sun in the top left corner
        sunMesh.position.x = -(window.innerWidth / 2) + sunGeometry.parameters.radius;
        sunMesh.position.y = (window.innerHeight / 2) - sunGeometry.parameters.radius;

        scene.add(sunMesh);
        sun = sunMesh;
    }
    const cloudTexture = new THREE.TextureLoader().load('realistic-white-cloud-png.webp');
    const cloudMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: opacity,
        color: tint // Black tint
    });
    const clouds = [];
    for (let i = 0; i < cloudsCount; i++) {
        const cloudGeometry = new THREE.PlaneGeometry(200, 200);
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(Math.random() * 200 - 100, Math.random() * 100 - 50, Math.random() * -200);
        cloud.rotation.z = Math.random() * Math.PI * 2;
        cloud.speed = Math.random() * 0.02 + 0.005; // Random speed between 0.005 and 0.025
        scene.add(cloud);
        clouds.push(cloud);
    }

    function animate() {
        requestAnimationFrame(animate);
        clouds.forEach(cloud => {
            cloud.position.x += cloud.speed * windFactor;
            if (cloud.position.x > 100) {
                cloud.position.x = -100;
            }
            cloud.rotation.z += cloud.speed * 0.01;
            if (Math.random() < lightningRate) { // Random chance for lightning
                cloud.material.opacity = 1;
                setTimeout(() => {
                    cloud.material.opacity = Math.random() + 0.3;
                }, 50); // Duration of the lightning flash
            }
        });

        if (needSun == true) {
            sun.rotation.x += 0.01;
            sun.rotation.z += 0.01;
        }

        renderer.render(scene, camera);
    }
    animate();
    skyPack = true;
}

function reformatDate(dateString) {
  // Parse the date string
  let date = new Date(dateString);

  // Extract the components
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  let day = date.getDate().toString().padStart(2, '0');
  let year = date.getFullYear();
  let hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  let minutes = date.getMinutes().toString().padStart(2, '0');
  let ampm = date.getHours() >= 12 ? 'PM' : 'AM';

  // Construct the formatted date string
  let formattedDate = `${hours}:${minutes} ${ampm}`;

  return formattedDate;
}

function success(pos) {
  const crd = pos.coords;
  lat = crd.latitude;
  lon = crd.longitude;
  fetchWeatherData(0, 10);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  alert(`ERROR(${err.code}): ${err.message}`);
}

async function fetchWeatherData(startRange, endRange) {
  const url = `https://api.weather.gov/points/${lat},${lon}`;

  await fetch(url)
    .then(response => response.json())
    .then(data => {
      const forecastHourlyUrl = data.properties.forecastHourly;

      fetchForecastHourly(forecastHourlyUrl, startRange, endRange);
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

async function getLocationFromIP() {
  try {
    const response = await fetch('https://ipinfo.io/json?token=YOUR_TOKEN'); // Use a service like ipinfo.io
    const data = await response.json();
    const loc = data.loc.split(','); // 'loc' contains latitude and longitude as 'lat,lon'
    lat = parseFloat(loc[0]);
    lon = parseFloat(loc[1]);
    fetchWeatherData(0, 10); // Fetch weather data based on the IP location
  } catch (error) {
    console.error('Error fetching location from IP:', error);
  }
}

function getUserLocalTime() {
  const now = new Date();
  return now.toLocaleTimeString(); // Returns a string representing the current time
}

function fetchForecastHourly(url, startRange, endRange) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const periods = data.properties.periods.slice(startRange, endRange);

      const timeCard = document.getElementsByClassName('glassy-div')[0];

      shortDesc = periods[0].shortForecast;
      currentHour = reformatDate(periods[0].startTime);
      document.getElementsByClassName('timeTitle')[0].innerHTML = getUserLocalTime();
      document.getElementsByClassName('currentTempTemp')[0].innerHTML = periods[0].temperature;
      document.getElementsByClassName('currentTempExtension')[0].innerHTML = "°" + periods[0].temperatureUnit;

      console.log(periods);

      periods.forEach(period => {
        const startTimeCell = document.createElement('div');
        startTimeCell.className = "timeSlot";

        const dateCell = document.createElement('div');
        dateCell.textContent = reformatDate(period.startTime);
        const tempCell = document.createElement('div');
        tempCell.textContent = `${period.temperature}°${period.temperatureUnit}`;
        const humidityCell = document.createElement('div');
        humidityCell.textContent = `${period.relativeHumidity.value}%`;

        startTimeCell.appendChild(dateCell);
        startTimeCell.appendChild(tempCell);
        startTimeCell.appendChild(humidityCell);

        timeCard.appendChild(startTimeCell);
      });
    })
    .catch(error => {
      console.error('Error fetching forecastHourly data:', error);
    });
}

function promptForLocation() {
  const locationPrompt = document.getElementById('location-prompt');
  const enableButton = document.getElementById('enable-button');

  enableButton.addEventListener('click', () => {
    locationPrompt.style.display = 'none';
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });

  locationPrompt.style.display = 'block';
}

function removeAmPmAndAddZero(timeString, options) {
  if (options == "removeOnly") {
    const withoutAmPm = timeString.replace(/ AM| PM/gi, "");
    return withoutAmPm;
  } else {
    const withoutAmPm = timeString.replace(/ AM| PM/gi, "");
    return withoutAmPm + ":00";
  }
}

function addNewTime() {
  const url = `https://api.weather.gov/points/${lat},${lon}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      fetch(data.properties.forecastHourly)
        .then(response => response.json())
        .then(data => {
          const period = data.properties.periods[document.getElementsByClassName("timeSlot").length - 1];
          const timeCard = document.getElementsByClassName('glassy-div')[0];
          const startTimeCell = document.createElement('div');
          startTimeCell.className = "timeSlot";

          const dateCell = document.createElement('div');
          dateCell.textContent = reformatDate(period.startTime);
          const tempCell = document.createElement('div');
          tempCell.textContent = `${period.temperature}°${period.temperatureUnit}`;
          const humidityCell = document.createElement('div');
          humidityCell.textContent = `${period.relativeHumidity.value}%`;

          startTimeCell.appendChild(dateCell);
          startTimeCell.appendChild(tempCell);
          startTimeCell.appendChild(humidityCell);

          timeCard.appendChild(startTimeCell);
        })
        .catch(error => {
          console.error('Error fetching forecastHourly data:', error);
        });
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
    });
}

function timeStringToNumber(timeString) {
  let [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function updateData() {
  const currentTime = timeStringToNumber(removeAmPmAndAddZero(getUserLocalTime(), 'removeOnly'));
  const checkpointTime = timeStringToNumber(removeAmPmAndAddZero(document.getElementsByClassName("timeSlot")[1].getElementsByTagName("div")[0].innerHTML, "no"));
  const timeSlots = document.getElementsByClassName("timeSlot");

  document.getElementsByClassName("timeTitle")[0].innerHTML = getUserLocalTime();

  if (currentTime > (checkpointTime + 30)) {
    console.log(currentTime, checkpointTime)
    timeSlots[1].remove();
    addNewTime();
  }
}

document.addEventListener("DOMContentLoaded", function() {
    try {
      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    } catch (error) {
      alert(error);
    }
    setInterval(sky, 500);
    setInterval(updateData, 500);
    setInterval(fetchWeatherData(0, 10), 300000);
});