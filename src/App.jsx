import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import './index.css'

const App = () => {
    const [link, setLink] = useState('')
    const [error, setError] = useState('')
    const [videoDetails, setVideoDetails] = useState(null)
    const [loading, setLoading] = useState(false)

    const isValidURL = (url) => {
        const pattern = new RegExp(
            '^(https?://)?(www.)?(youtube|facebook).com/.*$'
        )
        return pattern.test(url)
    }

    const handleDetect = async () => {
        if (!isValidURL(link)) {
            setError(
                'Invalid video link. Please enter a valid YouTube or Facebook link.'
            )
            setVideoDetails(null)
        } else {
            setLoading(true)
            try {
                const response = await axios.post('/api/download', {
                    url: link,
                })
                setVideoDetails(response.data)
                setError('')
            } catch (err) {
                setError('Error fetching video. Please try again.')
                setVideoDetails(null)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDownload = (formatUrl) => {
        const linkElement = document.createElement('a')
        linkElement.href = formatUrl
        linkElement.target = '_blank'
        linkElement.rel = 'noopener noreferrer'
        linkElement.download = true
        document.body.appendChild(linkElement)
        linkElement.click()
        document.body.removeChild(linkElement)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg space-y-6">
                <motion.h1
                    className="text-3xl font-bold mb-6 text-center text-gray-800"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Video & Audio Downloader
                </motion.h1>

                <motion.div
                    className="flex space-x-4 mb-4"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                        placeholder="Paste your video link here..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                        onClick={handleDetect}
                        disabled={loading}
                    >
                        {loading ? 'Detecting...' : 'Detect'}
                    </button>
                </motion.div>

                {error && (
                    <motion.p
                        className="text-red-500 text-center mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.p>
                )}

                {videoDetails && (
                    <motion.div
                        className="video-preview"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex space-x-4 mb-4">
                            <img
                                src={videoDetails.thumbnail}
                                alt={videoDetails.title}
                                className="w-24 h-24 rounded-lg shadow-md"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                    {videoDetails.title}
                                </h3>
                            </div>
                        </div>

                        <div className="download-options grid grid-cols-2 gap-4">
                            {videoDetails.formats.map((format, index) => (
                                <motion.button
                                    key={index}
                                    className="block w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
                                    onClick={() => handleDownload(format.url)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Download {format.quality} ({format.size})
                                </motion.button>
                            ))}
                        </div>

                        <div className="audio-options mt-4">
                            <h4 className="text-lg font-semibold mb-2">
                                Audio Only
                            </h4>
                            {videoDetails.audioFormats.map((audio, index) => (
                                <motion.button
                                    key={index}
                                    className="block w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200"
                                    onClick={() => handleDownload(audio.url)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Download {audio.quality} ({audio.size})
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default App
