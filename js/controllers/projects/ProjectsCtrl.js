sdApp.controller('ProjectsCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    'SyncService',
    'SettingService',
    function($rootScope, $scope, $state, SyncService, SettingService) {
        var vm = this;
        vm.go = go;
        vm.header = 'Select a project';
        vm.username = localStorage.getObject('dsremember');
        vm.local = {};
        $rootScope.projectName = '';
        vm.local.data = {};
        vm.loggedIn = localStorage.getObject('loggedIn');
        $rootScope.currentSD = null;
        SyncService.getProjects(function(result) {
            setTimeout(function() {
                $scope.$apply(function() {
                    vm.projects = result;
                })
            }, 100);
        }, function(err) {
            SettingService.show_message_popup('Error', '<span>Could not get the projects from store!</span>');
        });

        //get necessary settings for company
        SyncService.getSetting('units', function(list) {
            $rootScope.units = list && list.value;
        });
        SyncService.getSetting('absence', function(list) {
            $rootScope.absence = list && list.value;
        });
        SyncService.getSetting('staff', function(list) {
            $rootScope.staff = list && list.value;
        });
        SyncService.getSetting('resources', function(list) {
            $rootScope.resources = list && list.value;
        });
        SyncService.getSetting('currency', function(list) {
            $rootScope.currency = list && list.value;
        });
        SyncService.getSetting('start', function(list) {
            $rootScope.start = list && list.value;
        });
        SyncService.getSetting('finish', function(list) {
            $rootScope.finish = list && list.value;
        });
        SyncService.getSetting('break', function(list) {
            $rootScope.break = list && list.value;
        });

        function go(project) {
            sessionStorage.setObject('projectId', project.id);
            $rootScope.projectName = project.value.name;
            $state.go('app.project', {
                id: project.id
            });
        }
    }
]);
