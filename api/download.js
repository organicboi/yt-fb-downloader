import youtubedl from 'youtube-dl-exec'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { url } = req.body

    if (!url) {
        return res.status(400).json({ error: 'No video URL provided' })
    }

    try {
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        })

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
            )
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
}
