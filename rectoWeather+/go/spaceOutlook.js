function parseWeatherResponse(response) {
    const lines = response.split("\n");
    
    // Headers for the JSON object
    const headers = ["Radio Flux 10.7 cm", "Planetary A Index", "Largest Kp Index"];
    
    const weatherData = {
        headers: headers,
        rows: [] // Initialize rows as an array
    };
    
    // Iterate through the lines
    lines.forEach(line => {
        // Check if the line contains a valid date and data
        const match = line.match(/^(\d{4} \w{3} \d{2})\s+(\d+)\s+(\d+)\s+(\d+)/);
      
        if (match) {
            const date = match[1];
            const radioFlux = parseInt(match[2]);
            const aIndex = parseInt(match[3]);
            const kpIndex = parseInt(match[4]);
        
            // Push an object with the date as a key and the data as an array into the rows array
            weatherData.rows.push({
                [date]: [radioFlux, aIndex, kpIndex]
            });
        }
    });
    
    return weatherData;
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("https://services.swpc.noaa.gov/text/27-day-outlook.txt")
    .then(response => response.text())
    .then(data => {
        console.log("27-day space weather outlook: ", parseWeatherResponse(data));
    });
});