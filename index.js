const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const UserService = require('./UsersService');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const userService = new UserService;


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

//dołaczenie nowego użytkownika i poinformowanie o tym innych
io.on('connection', function(socket) {
	// po podłączeniu klienta dzieje się:
	//nasłuchiwanie na pojawienie się nowego użytkownika (join - nasze przyłączenie):
	socket.on('join', function(name){
		//nowego użytkownika dopisujemy do listy aktywnych:
		userService.addUser({
			id: socket.id,
			name
		});
		//aktualizacja listy aktywnych i powiadomienie o tym innych (update aktualizuje listę uczestników czatu):
		io.emit('update', {
			users: userService.getAllUsers()
		});
	});
});

// opuszczenie czatu
io.on('connection', function(socket) {
	socket.on('disconect', () => {
		userService.removeUser(socket.id);
		//socket.broadcast.emit wysyła update do wszystkich uczestników oprócz tego opuszczającego czat
		socket.broadcast.emit('update', {
			users: userService.getAllUsers()
		});
	});
});

// wysyłanie wiadomości do użytkowników
io.on('connection', function(socket) {
	socket.on('message', function(message) {
		const {name} = userService.getUserById(socket.id);
		socket.broadcast.emit('message', {
			text: message.text,
			from: name
		});
	});
});




server.listen(3000, function() {
	console.log('listening on *:3000');
});