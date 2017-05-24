angular.module($APP.name).controller('NavCtrl', NavCtrl)

NavCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', 'AuthService','SyncService'];

function NavCtrl($ionicSideMenuDelegate, $rootScope, $state, AuthService,SyncService) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.sync = sync;
    vm.go = go;
    vm.logout = logout;
    vm.username = localStorage.getObject('dsremember')
    vm.loggedIn = localStorage.getObject('loggedIn');

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft();
    };

    function sync() {
      SyncService.sync('Sync').then(function(){
        $state.reload();
      });
    }

    function go(predicate) {
            $state.go('app.' + predicate);
            console.log(predicate);
        }

    function logout(){
      AuthService.logout().then(function(result){
        localStorage.setObject('dsremember', null)
        $state.go('login');
      })
    }


    $rootScope.$watch(function() {
        return $ionicSideMenuDelegate.isOpen();
    }, function(isOpen) {
        $('#ds-menu-btn')
            .toggleClass("ion-navicon")
            .toggleClass("ion-android-arrow-back");
    })

}
