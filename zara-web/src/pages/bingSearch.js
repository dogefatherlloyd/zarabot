const axios = require('axios');

async function bingSearch(query) {
    const apiKey = process.env.BING_API_KEY;

    try {
        const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
            params: {
                q: query,
            },
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
            },
        });

        if (response.data.webPages && response.data.webPages.value.length > 0) {
            const result = response.data.webPages.value[0];
            return `**${result.name}**\n${result.snippet}\n${result.url}`;
        } else {
            return 'No results found.';
        }
    } catch (error) {
        console.error(error);
        return 'An error occurred while searching.';
    }
}

module.exports = bingSearch;
