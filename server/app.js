const express = require('express')
const { createReadStream, statSync, existsSync } = require('fs')
const path = require('path')

const app = express()

app.get('/videos/:filename', (req, res) => {
    const filename = req.params.filename
    const range = req.headers.range

    const filepath = path.join(__dirname, 'videos', `${filename}.mp4`)
    if(!existsSync(filepath)){
        return res.status(400).json('File not found')
    }
    const stat = statSync(filepath)
    const fileSize = stat.size

    if(range){
        let [start, end] = range.replace(/bytes=/, '').split('-')
        start = parseInt(start, 10)
        end = end ? parseInt(end, 10) : fileSize - 1
        const chunkSize = (end - start ) +  1
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4"
        })
        createReadStream(filepath, {start, end}).pipe(res)
    }
    else{
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4"
        })
        createReadStream(filepath).pipe(res)
    }
})

app.listen('8000', () => {
    console.log('Server started')
})