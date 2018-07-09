const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

var app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname + './../public')));
var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', function(socket) {
  console.log("New User Connected");

  socket.on('disconnect', function() {
    console.log("User Disconnected");
  });

  socket.emit('newMessage', {
    from: "Admin",
    text: "Welcome to the chat app",
    createdAt: new Date().getTime()
  });

  socket.broadcast.emit('newMessage', {
    from: "Admin",
    text: "New User Joined",
    createdAt: new Date().getTime()
  })

  socket.on('createMessage', function(message) {
    console.log('createMessage', message);

    io.emit('newMessage', {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime()
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
