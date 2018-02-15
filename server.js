const http = require('http');

const app = require('./app')

const port = 8090;
const server = http.createServer(app);

server.listen(port, ()=>{
	console.log('running on', port)
});

