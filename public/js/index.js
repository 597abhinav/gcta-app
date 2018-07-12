var app = angular.module('gcta', []);

app.controller('mainController', ['$scope', '$http', function($scope, $http) {
  var vm = this;

  $scope.message = {};
  $scope.messageArray = [];

  var socket = io();

  // ---------SOCKET CONNECT AND DISCONNECT---------//
  socket.on('connect', function() {
    console.log("Connected to Server");
  });

  socket.on('disconnect', function() {
    console.log("Disconnected from Server");
  });
  // ---------------------------------------------//

  socket.on('newMessage', function(mes) {
    $scope.$apply(function() {
    mes.createdAt = moment(mes.createdAt).format('h:mm a');

      console.log("New Message: ", mes);
      $scope.messageArray.push(mes);
    });
  });

  $scope.submit = function() {
    socket.emit('createMessage', {
      from: 'User',
      text: $scope.message.text
    }, function() {

    });
  };
}]);
