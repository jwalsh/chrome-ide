var connect = require('connect'),
// io = require('socket.io'),
server,
port = process.env.PORT || 3000;

server = connect.createServer();
server
	.use(
		connect
			.static(__dirname + '/public')
	)
	.listen(port);

// io.listen(server);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { load: new Date() });
  socket.on('status', function (data) {
    console.log(data);
		socket.emit('news', { connect: data });
  });
});

console.log("Running http://localhost:" + port + "/");
