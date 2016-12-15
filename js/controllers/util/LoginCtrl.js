angular.module($APP.name).controller('LoginCtrl', [
  '$rootScope',
  '$scope',
  '$state',
  '$ionicModal',
  '$ionicPopup',
  'AuthService',
  function ($rootScope, $scope, $state, $ionicModal, $ionicPopup, AuthService) {
    $scope.user ={};
    var vm = this;
    vm.showForgot = showForgot;
    vm.backForgot = backForgot;

    if(localStorage.getObject('dsremember')){
      $scope.user.username = localStorage.getObject('dsremember').username;
      $scope.user.password = localStorage.getObject('dsremember').password;
      $scope.user.remember = localStorage.getObject('dsremember').remember;
      $scope.user.id = localStorage.getObject('dsremember').id;
    }

    vm.projectModal = $ionicModal.fromTemplateUrl('templates/util/forgotPassword.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.projectModal = popover;
    });

    function showForgot() {
        vm.projectModal.show();
    }

    function backForgot() {
        vm.projectModal.hide();
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
            vm.projectModal.hide();
            $scope.syncPopup.close();
        });
    };

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
