angular.module($APP.name).controller('NavCtrl', NavCtrl)

NavCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', 'AuthService'];

function NavCtrl($ionicSideMenuDelegate, $rootScope, $state, AuthService) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.sync = sync;
    vm.go = go;
    vm.logout = logout;
    vm.username = localStorage.getObject('dsremember')

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft();
    };

    function sync() {
    }

    function go(predicate) {
            $state.go('app.' + predicate);
            console.log(predicate);
        }

    function logout(){
      AuthService.logout().then(function(result){
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
