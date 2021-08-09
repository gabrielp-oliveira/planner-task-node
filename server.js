const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()


let url = process.env.FRONT_URL?process.env.FRONT_URL:'http://localhost:3000'
app.use(cors({origin: url}))
app.use(bodyParser.json());
require('./routers/authController')(app)



app.get('/',(req, res) => {
  res.send({ok:'ok'})
})



server.listen(process.env.PORT || 8080, console.log('server iniciado'))