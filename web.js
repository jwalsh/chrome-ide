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

var io = require('socket.io').listen(server);

activeClients = 0;
io.sockets.on('connection', function(socket){ 
  activeClients +=1;
	function clientDisconnect(){
		activeClients -=1;
		socket.broadcast.send(activeClients + ' clients');
	}
  socket.broadcast.send(activeClients + ' clients');

  socket.on(
			'status', 
			function (data) {
				console.log(data);
				// This just shows the user agent and time when the 
				// client supplies the information:
				// socket.broadcast.send('status: ' + data);
			});


	// console.log({clients:activeClients});
  socket.on(
			'disconnect', 
			function(socket) {
				clientDisconnect();
			});
}); 

console.log("Running http://localhost:" + port + "/");
