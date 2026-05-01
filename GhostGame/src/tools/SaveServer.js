const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json())

app.post('/save-room', (req, res) => {
    const {roomKey, data} = req.body

    const filePath = path.join(__dirname, "..", 'assets', 'rooms', `${roomKey}.json`)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    res.json({ success: true})
})  

app.listen(3001, () => {
    console.log('Save server running on 3001')
})