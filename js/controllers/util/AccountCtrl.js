sdApp.controller('AccountCtrl', AccountCtrl)

AccountCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', 'ProjectService', 'AuthService'];

function AccountCtrl($ionicSideMenuDelegate, $rootScope, $state, ProjectService, AuthService) {
    var vm = this;
    vm.toggleSidemenu = toggleSidemenu;
    vm.editCurrentUser = editCurrentUser;
    vm.update = update;
    vm.username = localStorage.getObject('dsremember')
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.editAccount = false;
    vm.account = localStorage.getObject('my_account');

    function update() {
        var aux = {
            first_name: vm.account.first_name,
            last_name: vm.account.last_name,
            phone: vm.account.phone,
            customer_id: vm.account.customer_id,
            customer_name: vm.account.customer_name,
            login_name: vm.username.username,
            role: vm.loggedIn.roles,
            employer: vm.account.employer,
            id: vm.account.id,
            job_title: vm.account.job_title,
            active: true
        }
        ProjectService.update_account(aux).then(function(result) {
            vm.account = localStorage.getObject('my_account');
        });

        vm.editCurrentUser();
    }

    function editCurrentUser() {
        vm.editAccount = !vm.editAccount;
    }

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft();
    };

}
