angular.module($APP.name).controller('LoginCtrl', [
    '$rootScope',
    '$timeout',
    '$scope',
    '$state',
    '$ionicModal',
    '$ionicPopup',
    'AuthService',
    'SyncService',
    'ProjectService',
    function($rootScope, $timeout, $scope, $state, $ionicModal, $ionicPopup, AuthService, SyncService, ProjectService) {
        $scope.user = {};
        var vm = this;
        vm.go = go;

        if (localStorage.getObject('dsremember')) {
            $scope.user.username = localStorage.getObject('dsremember').username;
            $scope.user.password = localStorage.getObject('dsremember').password;
            $scope.user.remember = localStorage.getObject('dsremember').remember;
            $scope.user.id = localStorage.getObject('dsremember').id;
            if (!localStorage.getObject('loggedOut')) {
                AuthService.login($scope.user).success(function(result) {
                    SyncService.sync('Sync').then(function() {
                        localStorage.removeItem('loggedOut');
                        $state.go('app.home');
                    });
                }).error(function(result, status) {
                    switch (status) {
                        case 0:
                            SyncService.sync('Sync');
                            localStorage.removeItem('loggedOut');
                            break;
                        case -1:
                            SyncService.sync('Sync');
                            localStorage.removeItem('loggedOut');
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
        }

        function go(predicate, id) {
            $state.go(predicate);
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
            if ($scope.user.username && $scope.user.password) {
                AuthService.login($scope.user).success(function(result) {
                    localStorage.removeItem('loggedOut');
                    if (result.data.status) {
                        SyncService.sync('Sync');
                    } else {
                        if (result.data) {
                            if (result.data.role.id === 4) {
                                $state.go('app.shared')
                            } else {
                                SyncService.sync('Sync').then(function() {
                                    $state.go('app.home')
                                })
                            }
                            localStorage.setObject('loggedIn', result.data);
                            //get account for logged in user
                            ProjectService.my_account(result.data.id).then(function(result) {
                                localStorage.setObject('my_account', result);
                            })
                            if ($scope.user.remember) {
                                localStorage.setObject('dsremember', $scope.user);
                            } else {
                                localStorage.removeItem('dsremember');
                            }
                            localStorage.setObject('id', result.data.id)
                        } else {
                            $scope.userRemember = localStorage.getObject('dsremember');
                            if ($scope.userRemember) {}
                        }
                    }
                }).error(function(response, status) {
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
