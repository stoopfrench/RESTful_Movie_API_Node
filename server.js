const http = require('http')

const config = require('config')
const port = process.env.PORT || config.port

const app = require('./app')

const server = http.createServer(app)

server.listen(port, () => {
    console.log('running on', port)
})