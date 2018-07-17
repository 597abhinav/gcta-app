const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
var app = express();
const mongodb = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
const bodyParser = require('body-parser');

var {generateMessage} = require('./utils/message');
var {isRealString} = require('./utils/validation');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname + './../public')));

// Socket Static Code
var server = http.createServer(app);
var io = socketIO(server);

app.post('/chat', function(req, res) {
  io.on('connection', function(socket) {
    console.log("New User Connected");

    socket.on('disconnect', function() {
      console.log("User Disconnected");
    });

    socket.on('join', function(data) {
      console.log(data);
      if (!isRealString(req.body.displayName) || !isRealString(req.body.roomName)) {
        console.log('Name and room are required');
      }
      socket.join(data.roomName);
      socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
      socket.broadcast.to(data.roomName).emit('newMessage', generateMessage('Admin', data.displayName + ' has joined'));
    });

    socket.on('createMessage', function(message) {
      console.log('createMessage', message);
      io.emit('newMessage', generateMessage(message.from, message.text));
    });
  });
});

// Port Listen
server.listen(port, function() {
  console.log(`Server running on port ${port}`);
});
