const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const socket = require('./utils/socket')


let url = process.env.URL?process.env.URL:'http://localhost:3000'
app.use(cors({origin: url}))
app.use(bodyParser.json());

const io = require('socket.io')(server, {
  cors: {
    origin: url
  }
});

require('./routers/authController')(app)
require('./routers/planner')(app)
require('./routers/task')(app)
require('./routers/user')(app)

io.on('connection', (socket_Server) => socket(socket_Server, io))


app.get('/',(req, res) => {
  res.send({ok:'ok'})
})


app.locals.io = io

server.listen(process.env.PORT || 8080, console.log('server iniciado'))