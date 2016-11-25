angular.module($APP.name).controller('NavCtrl', NavCtrl)

NavCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', 'AuthService'];

function NavCtrl($ionicSideMenuDelegate, $rootScope, $state, AuthService) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.sync = sync;
    vm.logout = logout;
    vm.username = localStorage.getObject('dsremember')

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft();
    };

    function sync() {
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



    // $rootScope.$watch(function() {
    //     return SelectService.get('header');
    // }, function(header) {
    //     vm.settings.header = header;
    // })
}
