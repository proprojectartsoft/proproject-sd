sdApp.controller('SharedCtrl', SharedCtrl)

SharedCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', 'SharedService'];

function SharedCtrl($ionicSideMenuDelegate, $rootScope, $state, SharedService) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.go = go;
    vm.username = localStorage.getObject('dsremember');
    vm.loggedIn = localStorage.getObject('loggedIn');
    $rootScope.projectName = '';

    SharedService.shared_diary(false).then(function(result) {
        vm.shared = result;
    })

    SharedService.shared_diary(true).then(function(result) {
        vm.shared = result;
    })

    function go(predicate, id, project) {
        $rootScope.projectName = project;
        $state.go('app.' + predicate, {
            id: id
        });
    }

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft();
    };

}
