angular.module($APP.name).controller('ProjectsCtrl', [
    '$rootScope',
    '$state',
    '$indexedDB',
    function($rootScope, $state, $indexedDB) {
        var vm = this;
        vm.go = go;
        vm.header = 'Select a project'
        vm.username = localStorage.getObject('dsremember')
        vm.local = {};
        $rootScope.projectName = '';
        vm.local.data = {};
        vm.loggedIn = localStorage.getObject('loggedIn');

        $indexedDB.openStore('projects', function(store) {
            store.getAll().then(function(result) {
                vm.projects = result;
            });
        });

        function go(project) {
            localStorage.setObject('projectId', project.id);
            $rootScope.projectName = project.value.name;
            $state.go('app.project', {
                id: project.id
            });
        }
    }
]);
