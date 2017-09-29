sdApp.controller('SharedCtrl', SharedCtrl);

SharedCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', '$ionicPopup', 'PostService'];

function SharedCtrl($ionicSideMenuDelegate, $rootScope, $state, $ionicPopup, PostService) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.go = go;

    vm.displayDiary = false;
    vm.username = localStorage.getObject('sdremember');
    vm.loggedIn = localStorage.getObject('loggedIn');
    $rootScope.projectName = '';
    if (vm.displayDiary) {
        PostService.post({
            url: 'sharesitediary?shared=' + vm.displayDiary,
            method: 'GET',
            data: {}
        }, function(result) {
            vm.shared = result.data;
        }, function(error) {
            $ionicPopup.alert({
                title: 'Share',
                template: 'An unexpected error occured and shared diaries could not be displayed.'
            });
        })
    }

    function go(predicate, id, project) {
        $rootScope.projectName = project;
        $state.go('app.' + predicate, {
            id: id
        });
    }

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft();
    }

}
