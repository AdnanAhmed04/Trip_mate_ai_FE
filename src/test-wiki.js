
import https from 'https';

function getWikiImage(query) {
    return new Promise((resolve, reject) => {
        const headers = {
            'User-Agent': 'TripMate/1.0 (adnanahmedb7208@gmail.com)' // Good practice to include contact info
        };

        // Search API to find the page ID first
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

        https.get(searchUrl, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.query || !json.query.search || json.query.search.length === 0) {
                        resolve(null);
                        return;
                    }
                    const title = json.query.search[0].title;

                    // Now fetch main image for that title
                    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;

                    https.get(imgUrl, { headers }, (imgRes) => {
                        let imgData = '';
                        imgRes.on('data', chunk => imgData += chunk);
                        imgRes.on('end', () => {
                            try {
                                const imgJson = JSON.parse(imgData);
                                const pages = imgJson.query.pages;
                                const pageId = Object.keys(pages)[0];
                                if (pageId === '-1' || !imgJson.query.pages[pageId].thumbnail) {
                                    resolve(null);
                                } else {
                                    resolve(imgJson.query.pages[pageId].thumbnail.source);
                                }
                            } catch (e) {
                                reject(e);
                            }
                        });
                    }).on('error', err => reject(err));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', err => reject(err));
    });
}

(async () => {
    try {
        console.log("Searching for Mazar-e-Quaid...");
        console.log("Result:", await getWikiImage("Mazar-e-Quaid"));

        console.log("Searching for Eiffel Tower...");
        console.log("Result:", await getWikiImage("Eiffel Tower"));

        console.log("Searching for Random Place XYZ...");
        console.log("Result:", await getWikiImage("Random Place XYZ 123"));
    } catch (e) {
        console.error(e);
    }
})();
