async function fetchHTMLFromSite(url) {
    const proxyUrl = 'http://localhost:3000/proxy?url='; // Update with your proxy URL

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(url));
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        return doc;
    } catch (error) {
        console.error("Error fetching the HTML:", error);
    }
}

function extractDataFromInnerHTML(innerHTML) {
    const textMatches = innerHTML.match(/Text\[\d+\]=\[(.*?)\]/g);
    const styleMatches = innerHTML.match(/Style\[\d+\]=\[(.*?)\]/g);
    
    const extractedText = {};
    const extractedStyles = {};
    
    if (textMatches) {
        textMatches.forEach((match, index) => {
            const textContent = match.replace(/Text\[\d+\]=\[/, '').replace(/\],?/, '').split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map(item => item.replace(/'/g, '').trim());
            extractedText[`${index + 1}`] = textContent;
        });
    } else {
        console.log("No text matches found.");
    }

    if (styleMatches) {
        styleMatches.forEach((match, index) => {
            const styleContent = match.replace(/Style\[\d+\]=\[/, '').replace(/\],?/, '').split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map(item => item.replace(/'/g, '').trim());
            extractedStyles[`Style${index + 1}`] = styleContent;
        });
    } else {
        console.log("No style matches found.");
    }
    
    // Return the extracted text and styles
    return {
        Text: extractedText,
        Style: extractedStyles
    };
}

function findScriptElementFromDoc(doc) {
    const contentChildren = doc.getElementsByClassName("content")[0].children;

    for (let i = 0; i < contentChildren.length; i++) {
        let element = contentChildren[i];

        if (element.tagName === 'SCRIPT' &&
            element.type === 'text/javascript' &&
            element.getAttribute('language') === 'JavaScript1.2') {
            return element; // Return the first matching <script> element
        }
    }

    return null; // If no matching <script> element is found
}

async function fetchAndProcessHTML(url) {
    const doc = await fetchHTMLFromSite(url);

    if (doc) {
        const scriptElement = findScriptElementFromDoc(doc);

        if (scriptElement) {
            const innerHTML = scriptElement.innerHTML;
            
            const data = extractDataFromInnerHTML(innerHTML);
            console.log("Hurricane Data:", data.Text);
        } else {
            console.error("Script element not found");
        }
    }
}

// Example usage: Replace the URL with the target site
document.addEventListener('DOMContentLoaded', () => {
    fetchAndProcessHTML('https://www.nhc.noaa.gov/gtwo.php?basin=atlc&fdays=2');
});
