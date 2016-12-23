angular.module($APP.name).controller('ProjectsCtrl', [
    '$rootScope',
    '$state',
    '$scope',
    '$ionicSideMenuDelegate',
    '$timeout',
    '$ionicModal',
    '$indexedDB',
    'ProjectService',
    'SiteDiaryService',
    'SyncService',
    function($rootScope, $state, $scope, $ionicSideMenuDelegate, $timeout, $ionicModal, $indexedDB, ProjectService, SiteDiaryService, SyncService) {
        var vm = this;
        vm.showProject = showProject;
        vm.backProject = backProject;
        vm.saveProject = saveProject;
        vm.go = go;
        vm.header = 'Select a project'
        vm.username = localStorage.getObject('dsremember')
        vm.project = {};
        vm.local = {};
        $rootScope.projectName = '';
        vm.local.data = {};
        vm.test = [];
        vm.loggedIn = localStorage.getObject('loggedIn');
        SyncService.sync();
        $timeout(function(){
          $indexedDB.openStore('projects', function(store) {
              store.getAll().then(function(result) {
                  console.log("Extracted from DB",result);
                  vm.projects = result;
              });
          });

        },2000)
        vm.projectModal = $ionicModal.fromTemplateUrl('templates/projects/create.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.projectModal = popover;
        });

        $indexedDB.openStore('this', function(store) {

            store.insert({
                "ssn": "444-222-334",
                "name": "ISPAS",
                "age": 23
            }).then(function(e) {
                console.log('IT WORKS')
            });

        });

        function showProject() {
            vm.projectModal.show();
        }

        function backProject() {
            vm.projectModal.hide();
        }

        ProjectService.my_account(vm.loggedIn.id).then(function(result) {
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
            if ((vm.project.project_number > 0) && (vm.project.name.length > 0) && (vm.project.addr_firstline.length > 0)) {
                ProjectService.add_projects(vm.project).then(function(result) {
                    vm.projectModal.hide();
                    ProjectService.projects().then(function(result) {
                        vm.projects = result;
                    });
                })
                console.log('is it in yet?')
            }
        }

        function go(project) {
            localStorage.setObject('projectId', project.id);
            $rootScope.projectName = project.name;
            $state.go('app.project', {
                id: project.id
            });
        }
    }
]);
