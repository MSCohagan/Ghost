const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()

function isAllowedDevOrigin(origin) {
  if (!origin) return true

  try {
    const { hostname } = new URL(origin)

    if (hostname === 'localhost' || hostname === '127.0.0.1') return true
    if (hostname.endsWith('.ts.net')) return true
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true

    return false
  } catch {
    return false
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedDevOrigin(origin)) return callback(null, true)
      return callback(new Error(`Blocked by CORS: ${origin}`))
    },
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
