sdApp.controller('LoginCtrl', [
    '$rootScope',
    '$timeout',
    '$scope',
    '$state',
    '$ionicModal',
    '$ionicPopup',
    '$filter',
    'AuthService',
    'SyncService',
    'ProjectService',
    function($rootScope, $timeout, $scope, $state, $ionicModal, $ionicPopup, $filter, AuthService, SyncService, ProjectService) {
        $scope.user = {};
        var vm = this;
        vm.go = go;

        //if credentials remebered, login automatically
        if (localStorage.getObject('sdremember')) {
            $scope.user.username = localStorage.getObject('sdremember').username;
            $scope.user.password = localStorage.getObject('sdremember').password;
            $scope.user.remember = localStorage.getObject('sdremember').remember;
            $scope.user.id = localStorage.getObject('sdremember').id;
            var loginPopup = $ionicPopup.show({
                title: "Sync",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
            AuthService.login($scope.user).success(function(result) {
                SyncService.addDiariesToSync().then(function() {
                    SyncService.sync().then(function(projects) {
                        ProjectService.my_account(result.data.id).then(function(result) {
                            localStorage.setObject('my_account', result);
                        });
                        populate(function(res) {
                            loginPopup.close();
                            $state.go('app.home');
                        });
                    });
                })
            }).error(function(result, status) {
                switch (status) {
                    case 0:
                        SyncService.addDiariesToSync().then(function() {
                            SyncService.sync().then(function(projects) {
                                populate(function(res) {
                                    loginPopup.close();
                                });
                            })
                        });
                        break;
                    case -1:
                        SyncService.addDiariesToSync().then(function() {
                            SyncService.sync().then(function(projects) {
                                populate(function(res) {
                                    loginPopup.close();
                                });
                            })
                        });
                        break;
                    case 502:
                        loginPopup.close();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Offline',
                            template: "<center>Server offline</center>"
                        });
                        alertPopup.then(function(res) {});
                        break;
                    case 400:
                        loginPopup.close();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: "<center>Incorrect user data.</center>"
                        });
                        alertPopup.then(function(res) {});
                        break;
                    case 401:
                        loginPopup.close();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'Your account has been de-activated. Contact your supervisor for further information.',
                        });
                        alertPopup.then(function(res) {});
                        break;
                }
            })
        }

        function go(predicate, id) {
            $state.go(predicate);
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
                console.log(lists);
                lists = angular.copy(lists.settings);
                var getFiltered = function(item) {
                    var filtered = $filter('filter')(lists, {
                        name: item
                    }, true)[0];
                    if (filtered) return filtered;
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

        $scope.submit = function() {
            $scope.syncPopup = $ionicPopup.alert({
                title: "Sending request",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
            AuthService.forgotpassword($scope.user.username, true).then(function(result) {
                $scope.user.username = "";
                vm.go('login')
                $scope.syncPopup.close();
            });
        };

        $scope.login = function() {
            var loginPopup = $ionicPopup.show({
                title: "Sync",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
            if ($scope.user.username && $scope.user.password) {
                AuthService.login($scope.user).success(function(result) {
                    if (result.data) {
                        if (result.data.role.id === 4) {
                            loginPopup.close();
                            $state.go('app.shared');
                        } else {
                            SyncService.addDiariesToSync().then(function() {
                                SyncService.sync().then(function(projects) {
                                    loginPopup.close();
                                    populate(function(res) {
                                        $state.go('app.home', {}, {
                                            'reload': true
                                        });
                                    });
                                })
                            })
                        }
                        localStorage.setObject('loggedIn', result.data);
                        //get account for logged in user
                        ProjectService.my_account(result.data.id).then(function(result) {
                            localStorage.setObject('my_account', result);
                        });
                        if ($scope.user.remember) {
                            localStorage.setObject('sdremember', $scope.user);
                        } else {
                            localStorage.removeItem('sdremember');
                        }
                    } else {
                        loginPopup.close();
                    }
                }).error(function(response, status) {
                    loginPopup.close();
                    switch (status) {
                        case 0:
                            var alertPopup = $ionicPopup.alert({
                                title: 'Offline',
                                template: "<center>You are offline. Please check your internet connection and try again.</center>",
                            });
                            alertPopup.then(function(res) {});
                            break;
                        case -1:
                            var alertPopup = $ionicPopup.alert({
                                title: 'Offline',
                                template: "<center>You are offline. Please check your internet connection and try again.</center>",
                            });
                            alertPopup.then(function(res) {});
                            break;
                        case 502:
                            var alertPopup = $ionicPopup.alert({
                                title: 'Offline',
                                template: "<center>Server offline</center>",
                            });
                            alertPopup.then(function(res) {});
                            break;
                        case 400:
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: "<center>Incorrect user data.</center>",
                            });
                            alertPopup.then(function(res) {});
                            break;
                        case 401:
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: 'Your account has been de-activated. Contact your supervisor for further information.',
                            });
                            alertPopup.then(function(res) {});
                            break;
                    }
                })
            }
        };
    }
]);
