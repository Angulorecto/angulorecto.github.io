async function fetchElementFromRoute(url, elemtClass) {
    try {
        // Fetch the HTML content from the provided route
        const response = await fetch(url);

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
        }

        // Parse the response text (HTML)
        const htmlText = await response.text();

        // Create a temporary DOM element to hold the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        // Fetch the element by its class name
        const element = doc.getElementsByClassName(elemtClass)[0];

        if (element) {
            // Return the HTML content of the element
            return element.outerHTML;
        } else {
            throw new Error(`Element with class "${elemtClass}" not found`);
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchElementFromRoute('/', 'header')
        .then(elementHTML => {
            // Get the element to replace on the current page
            const targetElement = document.getElementsByClassName("header")[0];

            if (targetElement && elementHTML) {
                // Set the innerHTML to replace the content
                targetElement.innerHTML = elementHTML;
            } else {
                console.error("Target element not found or no HTML fetched");
            }
        });
});