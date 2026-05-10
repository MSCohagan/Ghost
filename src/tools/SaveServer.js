const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)
app.use(express.json())

app.post('/save-room', (req, res) => {
  console.log(req.body)
  const { roomKey, data } = req.body

  const filePath = path.join(__dirname, '..', '..', 'public', 'assets', 'rooms', `${roomKey}.json`)

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

  res.json({ success: true })
})

app.listen(3001, () => {
  console.log('Save server running on 3001')
})
