const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We need axios for API calls
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.removeHeader("X-Frame-Options");
    next();
});

// Replace this with YOUR actual key from RapidAPI
const RAPID_API_KEY = '0a07bc4674msh7b789f38c98b778p10337ejsnf22ebbdab555';

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: transparent; }
                .box { background: #111; padding: 30px; border-radius: 20px; text-align: center; color: white; width: 300px; border: 1px solid #333; }
                input { width: 90%; padding: 12px; margin-bottom: 15px; border-radius: 10px; border: none; background: #222; color: white; }
                button { width: 100%; padding: 12px; background: #ff4757; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="box">
                <input type="text" id="v" placeholder="Paste YouTube Link...">
                <button onclick="dl()">Get Download Link</button>
                <p id="s" style="font-size: 11px; margin-top: 10px; color: #888;"></p>
            </div>
            <script>
                async function dl() {
                    const url = document.getElementById('v').value;
                    const s = document.getElementById('s');
                    if(!url) return alert('Paste a link!');
                    
                    s.innerText = 'Requesting download...';
                    window.location.href = '/download?url=' + encodeURIComponent(url);
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    
    // Extracting the Video ID from the URL
    const videoId = videoURL.split('v=')[1]?.split('&')[0] || videoURL.split('/').pop();

    const options = {
        method: 'GET',
        url: 'https://youtube-video-and-shorts-downloader.p.rapidapi.com/video',
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': 'youtube-video-and-shorts-downloader.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        // Get the high-quality MP4 link from the API response
        const downloadUrl = response.data.streaming_data.formats[0].url;
        
        // Redirect the user directly to the video file
        res.redirect(downloadUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: Could not get download link.');
    }
});

app.listen(PORT, () => console.log('API Server Live'));