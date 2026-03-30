const cors = require('cors');

// 1. Allow Canva to talk to your server
app.use(cors());

// 2. Allow Canva to EMBED your server (The "Frame" Permission)
app.use((req, res, next) => {
    // This tells browsers: "It's okay if Canva shows my content"
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://*.canva.com https://*.canva.site");
    
    // An older security header some browsers still look for
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://www.canva.com/");
    next();
});
const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();
const PORT = process.env.PORT || 3000;

// This allows your Canva site to talk to this server
const cors = require('cors');
app.use(cors());

app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid YouTube link!');
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        
        // This pipes the video directly to the user's browser
        ytdl(videoURL, {
            quality: 'highestvideo',
            filter: 'audioandvideo'
        }).pipe(res);
        
    } catch (err) {
        res.status(500).send('YouTube blocked the request. Try again in a minute.');
    }
});

app.listen(PORT, () => console.log(`Server active on port ${PORT}`));
