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

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

console.log("Running http://localhost:" + port + "/");
