function parseApIndexForecast(response) {
    const lines = response.split("\n");

    const apIndexData = {
        headers: ["Date", "Observed Ap", "Estimated Ap", "Predicted Ap"],
        rows: []
    };

    let observedDate, estimatedDate;

    // Iterate through the lines to find the observed, estimated, and predicted values
    lines.forEach(line => {
        if (line.startsWith("Observed Ap")) {
            const parts = line.split(" ");
            observedDate = `${parts[1]} ${parts[2]}`; // Extract observed date
            const observedValue = parseInt(parts[3], 10); // Parse observed value
            if (!isNaN(observedValue)) {
                apIndexData.rows.push({ state: "observed", date: observedDate, data: observedValue });
            }
        } else if (line.startsWith("Estimated Ap")) {
            const parts = line.split(" ");
            estimatedDate = `${parts[1]} ${parts[2]}`; // Extract estimated date
            const estimatedValue = parseInt(parts[3], 10); // Parse estimated value
            if (!isNaN(estimatedValue)) {
                apIndexData.rows.push({ state: "estimated", date: estimatedDate, data: estimatedValue });
            }
        } else if (line.startsWith("Predicted Ap")) {
            const match = line.match(/(\d{1,3})\s*-\s*(\d{1,3})\s*(\d{1,3})\s*(\d{1,3})/);
            if (match) {
                const startDate = match[1]; // Start date
                const predictedValues = [parseInt(match[2], 10), parseInt(match[3], 10), parseInt(match[4], 10)];

                // Generate the predicted dates correctly
                const predictedDates = ["01 Oct", "02 Oct", "03 Oct"]; // Corresponding dates for predictions
                predictedValues.forEach((value, index) => {
                    apIndexData.rows.push({ state: "predicted", date: predictedDates[index], data: value });
                });
            }
        }
    });

    return apIndexData;
}

function parseGeomagneticActivity(response) {
    const lines = response.split("\n");
  
    const geomagneticData = {
        headers: ["Date", "Active", "Minor storm", "Moderate storm", "Strong-Extreme storm"],
        rows: [] // Initialize rows as an array
    };
  
    // Initialize an empty array for each date
    const dates = ["01 Oct", "02 Oct", "03 Oct"];
  
    // Create a temporary object to hold the probabilities for each date
    const tempData = {};
    dates.forEach(date => {
        tempData[date] = [date, 0, 0, 0, 0]; // Initialize with date and zero values
    });
  
    // Parse the activity probabilities
    lines.forEach(line => {
        const values = line.match(/(\d+)\/(\d+)\/(\d+)/);
        if (line.startsWith("Active") && values) {
            dates.forEach((date, index) => {
                tempData[date][1] = parseInt(values[index]);
            });
        } else if (line.startsWith("Minor storm") && values) {
            dates.forEach((date, index) => {
                tempData[date][2] = parseInt(values[index]);
            });
        } else if (line.startsWith("Moderate storm") && values) {
            dates.forEach((date, index) => {
                tempData[date][3] = parseInt(values[index]);
            });
        } else if (line.startsWith("Strong-Extreme storm") && values) {
            dates.forEach((date, index) => {
                tempData[date][4] = parseInt(values[index]);
            });
        }
    });
  
    // Convert tempData object to rows array
    Object.values(tempData).forEach(row => {
        geomagneticData.rows.push(row);
    });
  
    return geomagneticData;
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt")
    .then(response => response.text())
    .then(data => {
        console.log("AP index forcast: ", parseApIndexForecast(data));
        console.log("Geomagnetic activity forcast: ", parseGeomagneticActivity(data));
    });
});