var path = require('path');
var express = require('express')
var app = express();
var root = __dirname;
var dateFormat = require('dateformat');

app.use(express.static(path.join(root, './static')));
app.use('/scripts', express.static(__dirname + '/node_modules/sweetalert/dist/'))


app.set('views', path.join(root, './views'))
app.set('view engine', 'ejs')

app.get('/', function(req,res){
	res.render('index')
})

var server = app.listen(8000, function(){
	console.log('server is on 8000')
});

var io = require('socket.io').listen(server)

var users ={};
var messages = [];

io.sockets.on('connection', function(socket){

	socket.on('new_user', function(data){
		var user = data.user;
		users[socket.id] = user;
		messages.push( user+' has joined the chat. \n');
		socket.broadcast.emit('new_message', {user: user+' has joined the chat.', message: ''});
		socket.emit('all_messages', {messages:messages});
	})

	socket.on('message_sent', function(data){
		var message = data.message;
		messages.push( users[socket.id] + ': ' + message + '\n')
		socket.broadcast.emit('new_message', {user: users[socket.id] + ': ', message: message})
		socket.emit('new_message', {user: 'You: ', message: message})
	})

	socket.on('disconnect', function(){
		user = users[socket.id];
		delete users[socket.id];
		messages.push( user + ' has left the chat. \n');
		socket.broadcast.emit('new_message', {user: user+' has left the chat.', message: ''});
		if(Object.keys(users).length ==0){
			messages = []
		}
	})
})
