import express from 'express'
import youtubedl from 'youtube-dl-exec'
import cors from 'cors'

const app = express()
const port = 4000

app.use(express.json())
app.use(cors())

app.post('/download', async (req, res) => {
    const { url } = req.body

    if (!url) {
        return res.status(400).json({ error: 'No video URL provided' })
    }

    try {
        // Fetch video details using youtube-dl-exec
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        })

        // Separate video formats and audio-only formats
        const videoFormats = info.formats
            .filter(
                (format) => format.acodec !== 'none' && format.vcodec !== 'none'
            )
            .map((format) => ({
                quality: format.format_note,
                size: format.filesize
                    ? `${(format.filesize / (1024 * 1024)).toFixed(2)} MB`
                    : 'Unknown',
                url: format.url,
            }))

        const audioFormats = info.formats
            .filter(
                (format) => format.acodec !== 'none' && format.vcodec === 'none'
            ) // Audio-only formats
            .map((format) => ({
                quality: format.format_note || 'Audio',
                size: format.filesize
                    ? `${(format.filesize / (1024 * 1024)).toFixed(2)} MB`
                    : 'Unknown',
                url: format.url,
            }))

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            formats: videoFormats,
            audioFormats: audioFormats,
        })
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch video info' })
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
