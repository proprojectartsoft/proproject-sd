sdApp.controller('SharedCtrl', SharedCtrl);

SharedCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', 'PostService', '$ionicPopup'];

function SharedCtrl($ionicSideMenuDelegate, $rootScope, $state, PostService, $ionicPopup) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.go = go;

    vm.displayDiary = false;
    vm.username = localStorage.getObject('sdremember');
    vm.loggedIn = localStorage.getObject('loggedIn');
    $rootScope.projectName = '';
	
	PostService.post({
        url: 'sharesitediary',
        method: 'GET',
        params: {
            'shared': vm.displayDiary
        }
    }, function(result) {
        vm.shared = result;
    }, function(error) {
        $ionicPopup.alert({
            title: 'Share',
            template: 'An unexpected error occured and shared diaries could not be displayed.'
        });
    });

    function go(predicate, id, project) {
        $rootScope.projectName = project;
        $rootScope.go('app.' + predicate, {
            id: id
        });
    }

    function toggleSidemenu($event) {
	    $ionicSideMenuDelegate.toggleLeft();
    }

}
