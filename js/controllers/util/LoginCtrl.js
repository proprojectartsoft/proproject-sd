angular.module($APP.name).controller('LoginCtrl', [
  '$rootScope',
  '$timeout',
  '$scope',
  '$state',
  '$ionicModal',
  '$ionicPopup',
  'AuthService',
  'SyncService',
  function ($rootScope,$timeout, $scope, $state, $ionicModal, $ionicPopup, AuthService, SyncService) {
    $scope.user ={};
    var vm = this;
    vm.go = go;

    if(localStorage.getObject('dsremember')){
      $scope.user.username = localStorage.getObject('dsremember').username;
      $scope.user.password = localStorage.getObject('dsremember').password;
      $scope.user.remember = localStorage.getObject('dsremember').remember;
      $scope.user.id = localStorage.getObject('dsremember').id;
    }

    function go(predicate, id) {
        $state.go(predicate);
    }

    $scope.submit = function() {
        $scope.syncPopup = $ionicPopup.alert({
            title: "Sending request",
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });
        AuthService.forgotpassword($scope.user.username, true).then(function(result) {
            $scope.user.username = "";
            vm.go('login')
            $scope.syncPopup.close();
        });
    };

    $scope.login = function () {
      if($scope.user.username && $scope.user.password){
        AuthService.login($scope.user).then(function(result){
          if (result){
            if(result.role.id === 4){
              $state.go('app.shared')
            }else{
              $timeout(function () {
                SyncService.sync().then(function(){
                  $state.go('app.home')
                });
              });

            }
            localStorage.setObject('loggedIn', result)
            if($scope.user.remember){
              localStorage.setObject('dsremember', $scope.user);
            }
            else{
              localStorage.removeItem('dsremember');
            }
            localStorage.setObject('id',result.id)
          } else {
            $scope.userRemember = localStorage.getObject('dsremember');
            if ($scope.userRemember) {

            }
          }


        })
      }
    };
  }
]);
