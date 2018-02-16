const http = require('http')

const _var = require('./variables.js')
const port = _var.port

const app = require('./app')

const server = http.createServer(app)

server.listen(port, () => {
    console.log('running on', port)
})