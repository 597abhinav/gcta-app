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
    from: "Tony",
    text: "Hi Abhinav!",
    createdAt: 123
  });

  socket.on('createMessage', function(message) {
    console.log('createMessage', message);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
