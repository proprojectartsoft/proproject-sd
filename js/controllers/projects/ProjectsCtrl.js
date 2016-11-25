angular.module($APP.name).controller('ProjectsCtrl', [
    '$rootScope',
    '$state',
    '$scope',
    '$ionicSideMenuDelegate',
    '$timeout',
    '$ionicModal',
    'ProjectService',
    function($rootScope, $state, $scope, $ionicSideMenuDelegate, $timeout, $ionicModal, ProjectService) {
        var vm = this;
        vm.showProject = showProject;
        vm.backProject = backProject;
        vm.saveProject = saveProject;
        vm.go = go;

        vm.username = localStorage.getObject('dsremember')
        vm.project = {};
        vm.projectModal = $ionicModal.fromTemplateUrl('templates/projects/create.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.projectModal = popover;
        });

        ProjectService.projects().then(function(result) {
            vm.projects = result;
        });

        function showProject() {
            vm.projectModal.show();
        }

        function backProject() {
            vm.projectModal.hide();
        }

        ProjectService.my_account(vm.username.id).then(function(result) {
            vm.account = result;
        });

        function saveProject() {
            vm.project = {
                customer_id: vm.account.customer_id,
                project_number: vm.project.project_number,
                name: vm.project.name,
                addr_firstline: vm.project.addr_firstline,
                addr_secondline: vm.project.addr_secondline,
                addr_thirdline: vm.project.addr_thirdline,
                addr_forthline: vm.project.addr_forthline
            }
            ProjectService.add_projects(vm.project).then(function(result) {
                vm.projectModal.hide();
            })
        }

        function go(id) {
            localStorage.setObject('projectId', id);
            $state.go('app.project', {
                id: id
            });
        }
    }
]);
