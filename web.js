var connect = require('connect'),
io = require('socket.io'),
server,
port = process.env.PORT || 3000;

server = connect.createServer();
server
	.use(
		connect
			.static(__dirname + '/public')
	)
	.listen(port);

io.listen(server);

console.log("Running http://localhost:" + port + "/");
