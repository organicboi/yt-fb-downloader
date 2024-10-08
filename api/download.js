import { exec } from 'child_process'
import util from 'util'
const execPromise = util.promisify(exec)

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { url } = req.body

    if (!url) {
        return res.status(400).json({ error: 'No video URL provided' })
    }

    try {
        // Use yt-dlp command directly
        const { stdout, stderr } = await execPromise(
            `yt-dlp -j --no-warnings --prefer-free-formats --youtube-skip-dash-manifest ${url}`
        )

        console.log('STDOUT:', stdout) // Log stdout for debugging
        console.log('STDERR:', stderr) // Log stderr for debugging

        const info = JSON.parse(stdout) // Try parsing stdout

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
        console.error(err) // Log the actual error to the console
        res.status(500).json({
            error: 'Failed to fetch video info',
            details: err.message,
        })
    }
}
