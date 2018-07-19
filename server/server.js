const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
var app = express();
const mongodb = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
const bodyParser = require('body-parser');

const {generateMessage, generateLocationMessage} = require('./utils/message');
var {isRealString} = require('./utils/validation');
var {Users} = require('./utils/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname + './../public')));


//Tone Analyzer
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var toneAnalyzer = new ToneAnalyzerV3({
    url: "https://gateway.watsonplatform.net/tone-analyzer/api",
    username: "c942eb51-1f43-4d2b-ade7-bd1da1bba8ff",
    password: "DeOWWjJimQn0",
    version: '2018-07-09'
});

// Socket Static Code
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

io.on('connection', function(socket) {
  console.log("New User Connected");

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    var toneParams = {
      'tone_input': { 'text': message.text },
      'content_type': 'application/json'
    };

    toneAnalyzer.tone(toneParams, function (error, analysis) {
      if (error) {
        console.log(error);
      } else {
        console.log(analysis.document_tone.tones[0]);
      }
    });

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

// Port Listen
server.listen(port, function() {
  console.log(`Server running on port ${port}`);
});
