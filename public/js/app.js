var app = angular.module('gcta', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
            templateUrl: '../join.html',
            controller: 'joinCtrl',
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
app.controller('joinCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
  $scope.join = function(data) {
    console.log(data);
    $rootScope.userdetails = data;
  };
}]);

app.controller('chatCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
  var vm = this;
  vm.user = {};

  var socket = io();
  $scope.message = {};
  $scope.messageArray = [];

  // ---------SOCKET CONNECT AND DISCONNECT---------//
  socket.on('connect', function () {
    $scope.$apply(function() {
      var params = $rootScope.userdetails;

      socket.emit('join', params, function (err) {
        if (err) {
          alert(err);
          window.location.href = '/';
        } else {
          console.log('No error');
        }
      });
    });
  });

  socket.on('updateUserList', function (users) {
    $scope.$apply(function() {
      console.log(users);
      $scope.usersArray = users;
    });
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
