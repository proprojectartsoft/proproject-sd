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
    'PostService',
    'SettingService',
    function($rootScope, $timeout, $scope, $state, $ionicModal, $ionicPopup,
        $filter, AuthService, SyncService, PostService, SettingService) {
        $scope.user = {};
        var vm = this;
        vm.go = $rootScope.go;

        //if credentials remebered, login automatically
        if (localStorage.getObject('sdremember')) {
            $scope.user.username = localStorage.getObject('sdremember').username;
            $scope.user.password = localStorage.getObject('sdremember').password;
            $scope.user.remember = localStorage.getObject('sdremember').remember;
            $scope.user.id = localStorage.getObject('sdremember').id;
            $scope.user.gmt = -(new Date().getTimezoneOffset() / 60);

            var loginPopup = $ionicPopup.show({
                title: "Sync",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });

            AuthService.login($scope.user, function(result) {
                SyncService.addDiariesToSync().then(function() {
                    SyncService.sync().then(function(projects) {
                        PostService.post({
                            url: 'user/profile',
                            method: 'GET',
                            params: {
                                'id': result.data.id
                            }
                        }, function(result) {
                            localStorage.setObject('my_account', result.data);
                        }, function(error) {
                            console.log('Error getting my account data', error);
                        });
                        populate(function(res) {
                            loginPopup.close();
                            $rootScope.go('app.home');
                        });
                    }, function(reason) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: "<center>" + reason + "</center>"
                        });
                        alertPopup.then(function(res) {
                            loginPopup.close();
                            $state.reload();
                            return false;
                        });
                    });
                })
            }, function(rejection) {
                SettingService.close_all_popups();
                switch (rejection) {
                    case 0:
                        SyncService.addDiariesToSync().then(function() {
                            SyncService.sync().then(function(projects) {
                                populate(function(res) {
                                    loginPopup.close();
                                });
                            }, function(reason) {
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Error',
                                    template: "<center>" + reason + "</center>"
                                });
                                alertPopup.then(function(res) {
                                    loginPopup.close();
                                    $state.reload();
                                    return false;
                                });
                            });
                        });
                        break;
                    case -1:
                        SyncService.addDiariesToSync().then(function() {
                            SyncService.sync().then(function(projects) {
                                populate(function(res) {
                                    loginPopup.close();
                                });
                            }, function(reason) {
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Error',
                                    template: "<center>" + reason + "</center>"
                                });
                                alertPopup.then(function(res) {
                                    loginPopup.close();
                                    $state.reload();
                                    return false;
                                });
                            });
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
            });
        }

        /**
         * Method to populate the main page
         * @param {Function} callback - callback function
         */
        function populate(callback) {
            // get projects then callback
            SyncService.getProjects(function(result) {
                $rootScope.projects = result;
                //TODO: set start, break, finish from porject settings
                callback(result);
            }, function(err) {
                SettingService.show_message_popup('Error', '<span>Could not get the projects from store!</span>');
                callback(err);
            });

            //get necessary settings for company and put them on the $rootScope
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
                //TODO: set start, break, finish from company settings only if not set from project settings
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
                vm.go('login');
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
                $scope.user.gmt = -(new Date().getTimezoneOffset() / 60);
                AuthService.login($scope.user, function(result) {
                    if (result.data) {
                        if (result.data.role.id === 4) {
                            loginPopup.close();
                            $rootScope.go('app.shared');
                        } else {
                            SyncService.addDiariesToSync().then(function() {
                                SyncService.sync().then(function(projects) {
                                    loginPopup.close();
                                    populate(function(res) {
                                        $rootScope.go('app.home', {}, {
                                            'reload': true
                                        });
                                    });
                                }, function(reason) {
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Error',
                                        template: "<center>" + reason + "</center>"
                                    });
                                    alertPopup.then(function(res) {
                                        loginPopup.close();
                                        $state.reload();
                                        return false;
                                    });
                                });
                            })
                        }
                        //get account for logged in user
                        PostService.post({
                            url: 'user/profile',
                            method: 'GET',
                            params: {
                                'id': result.data.id
                            }
                        }, function(result) {
                            localStorage.setObject('my_account', result.data);
                        }, function(error) {
                            console.log('Error getting my account data', error);
                        });
                        if ($scope.user.remember) {
                            localStorage.setObject('sdremember', $scope.user);
                        } else {
                            localStorage.removeItem('sdremember');
                        }
                    } else {
                        loginPopup.close();
                    }
                }, function(response) {
                    loginPopup.close();
                    var alertMessage = {};
                    switch (response) {
                        case 0:
                            alertMessage = {
                                title: 'Offline',
                                template: "<center>You are offline. Please check your internet connection and try again.</center>"
                            };
                            break;
                        case -1:
                            alertMessage = {
                                title: 'Offline',
                                template: "<center>You are offline. Please check your internet connection and try again.</center>"
                            };
                            break;
                        case 502:
                            alertMessage = {
                                title: 'Offline',
                                template: "<center>Server offline</center>"
                            };
                            break;
                        case 400:
                            alertMessage = {
                                title: 'Error',
                                template: "<center>Incorrect user data.</center>"
                            };
                            break;
                        case 401:
                            alertMessage = {
                                title: 'Error',
                                template: 'Your account has been de-activated. Contact your supervisor for further information.'
                            };
                            break;
                    }
                    var alertPopup = $ionicPopup.alert(alertMessage);
                    alertPopup.then(function() {});
                });
            }
        };
    }
]);
