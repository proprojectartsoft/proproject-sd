sdApp.controller('NavCtrl', NavCtrl);

NavCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', '$ionicPopup', 'AuthService', 'SyncService', '$timeout', '$filter'];

function NavCtrl($ionicSideMenuDelegate, $rootScope, $state, $ionicPopup, AuthService, SyncService, $timeout, $filter) {
    var vm = this,
        loadingTemplate = "<center><ion-spinner icon='android'></ion-spinner></center>" +
        "<center ng-if=\'$root.diaryCounter'\>{{$root.diaryCounter}} / {{$root.diaryCounterTotal}}</center>";
    vm.toggleSidemenu = toggleSidemenu;
    vm.sync = sync;
    vm.logout = logout;
    vm.username = localStorage.getObject('sdremember');
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.go = $rootScope.go;

    function toggleSidemenu($event) {
        $ionicSideMenuDelegate.toggleLeft(true);
    }

    function sync() {
        if (navigator.onLine) {
            var syncPopup = loadingPopover("Sync", loadingTemplate, "loading");
        }
        SyncService.addDiariesToSync().then(function() {
            SyncService.sync().then(function() {
                populate(function(res) {
                    if (syncPopup)
                        syncPopup.close();
                    $rootScope.go('app.home');
                })
            }, function(err) {
                populate(function(res) {
                    if (syncPopup)
                        syncPopup.close();
                    $rootScope.go('app.home');
                })
            });
        })
    }

    function populate(callback) {
        SyncService.getProjects(function(result) {
            $rootScope.projects = result;
            callback();
        }, function(err) {
            SettingService.show_message_popup('Error', '<span>Could not get the projects from store!</span>');
            callback();
        });
        //get necessary settings for company
        SyncService.getSettings(function(lists) {
            lists = angular.copy(lists.settings);
            var getFiltered = function(item) {
                var filtered = $filter('filter')(lists, {
                    name: item
                }, true);
                if (filtered && filtered.length) return filtered[0];
                return {
                    value: false
                };
            };
            $rootScope.units = getFiltered('units').value;
            $rootScope.absence = getFiltered('absence').value;
            $rootScope.staff = getFiltered('staff').value;
            $rootScope.resources = getFiltered('resources').value;
            $rootScope.currency = getFiltered('currency').value || 'GBP';
            $rootScope.start = getFiltered('start').value;
            $rootScope.finish = getFiltered('finish').value;
            $rootScope.break = getFiltered('break').value;
        });
    }

    function logout() {
        if (navigator.onLine) {
            $rootScope.go('login');
            localStorage.removeItem('sdremember');
            SyncService.clearDb(function(e) {
                AuthService.logout().then(function(result) {});
            });
        } else {
            var errorTemplate = "<center>Can't log out now. You are offline.</center>";
            loadingPopover("Error", errorTemplate, "error");
        }
    }

    function loadingPopover(title, template, loadingOrError) {
        var pop = $ionicPopup.show({
            title: title,
            template: template,
            content: "",
            buttons: loadingOrError === "error" ? [{
                text: 'Ok',
                type: 'button-positive',
                onTap: function() {
                    pop.close();
                }
            }] : []
        });
        return pop;
    }
}
