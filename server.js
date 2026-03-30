const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Enable CORS for Canva
app.use(cors());

// 2. Set Security Headers so Canva can "Embed" the site
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://*.canva.com https://*.canva.site");
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://www.canva.com/");
    next();
});

// 3. Serve the HTML page (the "Box" for Canva)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: transparent; color: white; }
                .box { background: rgba(0,0,0,0.5); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid #444; width: 300px; }
                input { width: 80%; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: none; }
                button { padding: 10px 20px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="box">
                <input type="text" id="url" placeholder="Paste YouTube Link...">
                <button onclick="dl()">Download</button>
                <p id="status" style="font-size: 10px;"></p>
            </div>
            <script>
                function dl() {
                    const val = document.getElementById('url').value;
                    if(!val) return alert('Paste a link!');
                    document.getElementById('status').innerText = 'Starting...';
                    window.location.href = '/download?url=' + encodeURIComponent(val);
                }
            </script>
        </body>
        </html>
    `);
});

// 4. The Download Logic
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    if (!ytdl.validateURL(videoURL)) return res.status(400).send('Invalid Link');

    try {
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        ytdl(videoURL, { quality: 'highestvideo' }).pipe(res);
    } catch (err) {
        res.status(500).send('Error downloading video');
    }
});

app.listen(PORT, () => console.log('Server running on ' + PORT));
