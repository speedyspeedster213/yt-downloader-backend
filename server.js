app.get('/download', async (req, res) => {
    const videoURL = req.query.url;

    // 1. Better Video ID Extraction (Handles Shorts, Mobile, and Desktop links)
    let videoId = '';
    try {
        if (videoURL.includes('v=')) {
            videoId = videoURL.split('v=')[1].split('&')[0];
        } else if (videoURL.includes('youtu.be/')) {
            videoId = videoURL.split('youtu.be/')[1].split('?')[0];
        } else if (videoURL.includes('shorts/')) {
            videoId = videoURL.split('shorts/')[1].split('?')[0];
        } else {
            videoId = videoURL.split('/').pop().split('?')[0];
        }
    } catch (e) {
        return res.status(400).send('Could not parse YouTube ID. Please check the link.');
    }

    // 2. The API Request (Updated to the more stable /video endpoint)
    const options = {
        method: 'GET',
        url: 'https://youtube-video-and-shorts-downloader.p.rapidapi.com/video',
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': '0a07bc4674msh7b789f38c98b778p10337ejsnf22ebbdab555', // <--- PASTE YOUR KEY HERE
            'x-rapidapi-host': 'youtube-video-and-shorts-downloader.p.rapidapi.com'
        }
    };

    try {
        console.log('Requesting ID:', videoId);
        const response = await axios.request(options);
        
        // 3. Finding the BEST link in the mess of data the API sends back
        // We look for "formats" (which usually have audio + video combined)
        const formats = response.data.streaming_data?.formats;
        
        if (formats && formats.length > 0) {
            // Take the first available high-quality link
            const downloadUrl = formats[0].url;
            console.log('Success! Redirecting to video file.');
            res.redirect(downloadUrl);
        } else {
            console.log('API responded but no download links were found.');
            res.status(404).send('Error: This specific video cannot be downloaded (might be restricted).');
        }

    } catch (error) {
        // This tells us EXACTLY why it failed in the Render Logs
        console.error('API Error Status:', error.response?.status);
        console.error('API Error Data:', error.response?.data);
        
        if (error.response?.status === 401) {
            res.status(500).send('Error: Your RapidAPI Key is invalid or not active.');
        } else {
            res.status(500).send('Error: The download server is busy. Try again in a moment.');
        }
    }
});