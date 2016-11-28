angular.module($APP.name).controller('LoginCtrl', [
  '$rootScope',
  '$scope',
  '$state',
  'AuthService',
  function ($rootScope, $scope, $state, AuthService) {
    $scope.user ={};

    if(localStorage.getObject('dsremember')){
      $scope.user.username = localStorage.getObject('dsremember').username;
      $scope.user.password = localStorage.getObject('dsremember').password;
      $scope.user.remember = localStorage.getObject('dsremember').remember;
      $scope.user.id = localStorage.getObject('dsremember').id;
    }

    $scope.login = function () {
      if($scope.user.username && $scope.user.password){
        AuthService.login($scope.user).then(function(result){
          localStorage.setObject('loggedIn', result)
          if($scope.user.remember){
            localStorage.setObject('dsremember', $scope.user);
          }
          else{
            localStorage.removeItem('dsremember');
          }
          $state.go('app.home');
          localStorage.setObject('id',result.id)
        })
      }
    };
  }
]);
