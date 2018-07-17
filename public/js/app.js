var app = angular.module('gcta', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
            templateUrl: '../join.html',
            controller: 'joinFormCtrl',
            css: 'css/join.css'
    })
      .when('/chat', {
            templateUrl: '../chat.html',
            controller: 'chatCtrl',
            css: 'css/style.css'
    })
      .otherwise({
            redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
}]);

app.controller('joinFormCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
  var vm = this;

  vm.user = {};

  $scope.join = function(data) {
    console.log(data);
    $http.post('/chat', data);
    $rootScope.userdetails = data;
  };
}]);

app.controller('chatCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
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

  socket.emit('join', $rootScope.userdetails, function (err) {
    if (err) {
      alert(err);
    } else {
      console.log("No error");
    }
  });

  $scope.submit = function() {
    socket.emit('createMessage', {
      from: 'User',
      text: $scope.message.text
    }, function() {

    });
  };
}]);
