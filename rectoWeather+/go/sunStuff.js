// Function to extract headers correctly by matching month and day pairs like 'Sep 09'
function extractHeaders(headerLine) {
    const headerPattern = /[A-Za-z]{3} \d{2}/g; // Match headers with format 'Sep 09'
    return headerLine.match(headerPattern) || []; // Return matched headers or an empty array if none
}

// Enhanced function to parse dynamic tables with custom time or category fields
function parseDynamicTable(text, tableTitle, nextSectionTitle, specialField) {
    const tablePattern = new RegExp(
        `${tableTitle}[^\\n]*\\n([\\s\\S]*?)(?=\\n\\s*${nextSectionTitle}|\\n\\s*Rationale:|$)`,
        'i'
    );

    const tableMatches = tablePattern.exec(text);
    if (!tableMatches) {
        console.error(`Failed to parse ${tableTitle}`);
        return null;
    }

    const tableContent = tableMatches[1].trim();
    const lines = tableContent.split('\n').map(line => line.trim());

    // Extract headers using the extractHeaders function
    const headers = extractHeaders(lines[0]);

    // Parse rows by considering the first column as the special field (time or category)
    const rows = lines.slice(1).map(row => {
        const values = row.split(/\s{2,}/).map(value => value.trim());
        const rowData = { [specialField]: values[0] || '' }; // Use the first value as the special field
        headers.forEach((header, index) => {
            rowData[header] = values[index + 1] || ''; // Shift index by 1 to map correctly
        });
        return rowData;
    });

    return { headers, rows };
}

// Main function to test the parsing and display structured results
document.addEventListener("DOMContentLoaded", () => {
    // Fetch the data from the URL
    fetch('https://services.swpc.noaa.gov/text/3-day-forecast.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Parse the response as text
        })
        .then(data => {
            const kpIndex = parseKpIndexTable(data);
            const solarRadiation = parseSolarRadiationTable(data);
            const radioBlackout = parseRadioBlackoutTable(data);

            console.log("Kp Index Breakdown:", kpIndex);
            console.log("Solar Radiation Storm Forecast:", solarRadiation);
            console.log("Radio Blackout Forecast:", radioBlackout);
        })
        .catch(error => {
            console.error('Error fetching the data:', error);
        });
});

// Parsing function tailored for the Kp Index section, extracting time as a special field
function parseKpIndexTable(text) {
    return parseDynamicTable(
        text,
        "NOAA Kp index breakdown", // Section header for the Kp Index Breakdown
        "B. NOAA Solar Radiation Activity Observation and Forecast", // Next section header
        "time" // Use 'time' as the special field for Kp Index rows
    );
}

// Parsing function for the Solar Radiation Storm Forecast with 'category' as the special field
function parseSolarRadiationTable(text) {
    return parseDynamicTable(
        text,
        "Solar Radiation Storm Forecast", // Section header for the Solar Radiation Storm Forecast
        "C. NOAA Radio Blackout Activity and Forecast", // Next section header
        "category" // Use 'category' as the special field for Solar Radiation rows
    );
}

// Parsing function for the Radio Blackout Forecast with 'category' as the special field
function parseRadioBlackoutTable(text) {
    return parseDynamicTable(
        text,
        "Radio Blackout Forecast", // Section header for the Radio Blackout Forecast
        "Rationale:", // Next section header
        "category" // Use 'category' as the special field for Radio Blackout rows
    );
}