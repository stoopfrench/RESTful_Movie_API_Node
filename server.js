const http = require('http')

const _var = require('config')
const port = process.env.PORT || _var.port

const app = require('./app')

const server = http.createServer(app)

server.listen(port, () => {
    console.log('running on', port)
})