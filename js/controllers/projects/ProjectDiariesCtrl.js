angular.module($APP.name).controller('ProjectDiariesCtrl', ProjectDiariesCtrl)

ProjectDiariesCtrl.$inject = [
    '$scope',
    '$timeout',
    '$ionicModal',
    '$ionicPopup',
    '$state',
    '$stateParams',
    '$indexedDB',
    'SiteDiaryService',
    'SettingService',
    'SharedService',
    'SyncService',
    'orderByFilter',
    '$rootScope',
    '$filter',
];

function ProjectDiariesCtrl($scope, $timeout, $ionicModal, $ionicPopup, $state, $stateParams, $indexedDB, SiteDiaryService, SettingService, SharedService, SyncService, orderBy, $rootScope, $filter) {
    var vm = this,
        shares = [];
    vm.showDiary = showDiary;
    vm.backDiary = backDiary;
    vm.togglePlus = togglePlus;
    vm.go = go;
    vm.deleteDiary = deleteDiary;
    sessionStorage.setObject('editMode', null);
    SettingService.clearWeather();
    sessionStorage.setObject('diaryId', null);
    sessionStorage.setObject('projectId', parseInt($stateParams.id));
    sessionStorage.setObject('sd.diary.shares', null);
    vm.projectId = parseInt($stateParams.id);
    vm.filter = {};
    vm.shareId = {};
    vm.state = '';
    vm.show = false;
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    sessionStorage.setObject('sd.seen', {});
    $indexedDB.openStore('projects', function(store) {
        store.find(vm.projectId).then(function(e) {
            e.temp = null;
            store.upsert(e).then(
                function(e) {},
                function(err) {})
        }, function(err) {
            SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
        });
    });
    vm.selectOpt = [{
        id: 0,
        name: 'Annual leave'
    }, {
        id: 1,
        name: 'Inclement weather'
    }, {
        id: 2,
        name: 'No show'
    }, {
        id: 3,
        name: 'On other site'
    }, {
        id: 4,
        name: 'Public holiday'
    }, {
        id: 5,
        name: 'RDO'
    }, {
        id: 6,
        name: 'Sick leave'
    }, {
        id: 7,
        name: 'Unpaid leave'
    }, {
        id: 8,
        name: 'Training'
    }, {
        id: 9,
        name: 'Went home sick'
    }, {
        id: 10,
        name: 'Went to another project'
    }, {
        id: 11,
        name: 'Other'
    }];

    $indexedDB.openStore('projects', function(store) {
        vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.diaryModal = popover;
        });
        store.find(vm.projectId).then(function(e) {
            vm.diary = e.value.diaries;
            var list = "";
            angular.forEach(vm.diary, function(d) {
                list += d.data && ("<span style='color:red'>" + d.data.id + "</span> - <span style='color:blue'>" + d.data.user_name + ';</span> ');
            })
            angular.forEach(e.value.diaries, function(value, key) {
                e.value.diaries[key].color = $scope.getSdTitleColor(value.userName)
            });
            vm.diaries = orderBy(e.value.diaries, 'date', true);
            //update the color in indexedDB
            store.upsert(e).then(
                function(e) {},
                function(err) {}
            )
        }, function(err) {
            SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
        });
    });

    $scope.filter = {};

    function createPopup(id) {
        return {
            template: '<input type="email" ng-model="filter.email">',
            title: 'Share form',
            subTitle: 'Please enter a valid e-mail address.',
            scope: $scope,
            buttons: [{
                text: '<i class="ion-person-add"></i>',
                onTap: function(e) {
                    $scope.importContact(id);
                }
            }, {
                text: 'Cancel',
            }, {
                text: 'Send',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.filter.email) {
                        e.preventDefault();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Share',
                            template: "",
                            content: "Please insert a valid e-mail address.",
                            buttons: [{
                                text: 'OK',
                                type: 'button-positive',
                                onTap: function(e) {
                                    alertPopup.close();
                                }
                            }]
                        });
                    } else {
                        sendEmail($scope.filter.email, id);
                    }
                }
            }]
        }
    }

    function sendEmail(res, id) {
        if (res && navigator.onLine) {
            var alertPopup1 = $ionicPopup.alert({
                title: "Sending email",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
            SharedService.share_diary(id, res).then(function(response) {
                    alertPopup1.close();
                    if (response.message === "Site diary Shared!") {
                        res = "";
                        var alertPopup = $ionicPopup.alert({
                            title: 'Share',
                            template: 'Email sent.'
                        });
                        alertPopup.then(function(res) {});
                    }
                    sessionStorage.setObject('sd.diary.shares', null);
                },
                function(err) {
                    alertPopup1.close();
                    if (err.status == 422) {
                        res = "";
                        var alertPopup = $ionicPopup.alert({
                            title: 'Share',
                            template: 'Form already shared to this user.'
                        });
                    } else {
                        var alertPopupC = $ionicPopup.alert({
                            title: 'Share',
                            template: 'An unexpected error occured while sending the e-mail.'
                        });
                    }
                });
        } else {
            $ionicPopup.alert({
                title: 'Share',
                template: 'The email will be sent once you go online.'
            });
            shares.push({
                id: id,
                res: res
            })
            sessionStorage.setObject('sd.diary.shares', shares);
        }
    }

    $scope.importContact = function(id) {
        $timeout(function() {
            navigator.contacts.pickContact(function(contact) {
                if (contact.emails) {
                    $scope.filter.email = contact.emails[0].value;
                    $timeout(function() {
                        var popup = $ionicPopup.show(createPopup(id));
                    });
                } else {
                    var alertPopup1 = $ionicPopup.alert({
                        title: 'Share',
                        template: "",
                        content: "No e-mail address was found. Please enter one manually.",
                        buttons: [{
                            text: 'OK',
                            type: 'button-positive',
                            onTap: function(e) {
                                alertPopup1.close();
                                var popup = $ionicPopup.show(createPopup(id));
                            }
                        }]
                    });
                }
            }, function(err) {
                var alertPopup1 = SecuredPopups.show('alert', {
                    title: "Import contact failed",
                    template: 'An unexpected error occured while trying to import contact',
                });
                $timeout(function() {
                    var popup = $ionicPopup.show(createPopup(id));
                });
            });
        });
    }
    $scope.data = {};
    $scope.showPopup = function(predicate) {
        var popup = $ionicPopup.show(createPopup(predicate.id));
    };

    function deleteDiary(id) {
        $('.delete-btn').attr("disabled", true);
        $('.item-content').css('transform', '');
        var syncPopup = $ionicPopup.show({
            title: "Removing Site Diary",
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });
        SiteDiaryService.delete_diary(id).success(function(result) {
            SyncService.addDiariesToSync().then(function() {
                SyncService.sync().then(function() {
                    $('.delete-btn').attr("disabled", false);
                    syncPopup.close();
                    vm.diaries.splice(jQuery.inArray($filter('filter')(vm.diaries, {
                        id: id
                    })[0], vm.diaries), 1);
                })
            })
        }).error(function(res) {
            syncPopup.close();
            var errPopup = $ionicPopup.show({
                title: "You are offline",
                template: "<center>You can remove Site Diaries when online.</center>",
                content: "",
                buttons: [{
                    text: 'Ok',
                    type: 'button-positive',
                    onTap: function(e) {
                        errPopup.close();
                    }
                }]
            });
        })
    }

    function togglePlus() {
        vm.show = !vm.show;
    }

    function showDiary() {
        vm.diaryModal.show();
        vm.state = 'search';
    }

    function backDiary() {
        vm.diaryModal.hide();
        vm.show = false;
    }

    function saveDiary() {
        if (vm && vm.diaryModal) {
            vm.diaryModal.hide();
        }
    };

    function go(predicate, id) {
        $state.go('app.' + predicate, {
            id: id
        });
        vm.diaryModal.hide();
    }
    //color generator for tiles
    var red = 0,
        green = 0,
        blue = 0,
        colorsForName = {},
        contrastColors = ['navy', 'red', 'blue', 'teal', 'olive', 'orange',
            'green', 'blueviolet', 'maroon', 'fuchsia', 'purple', 'gray', 'violet'
        ];
    $scope.getSdTitleColor = function(userName) {
        var nameExists = Object.keys(colorsForName).some(function(name) {
            return name === userName;
        })
        if (!nameExists) {
            if (Object.keys(colorsForName).length < contrastColors.length) {
                colorsForName[userName] = contrastColors[Object.keys(colorsForName).length];
            } else {
                if (red + 50 <= 200) {
                    red += 50;
                } else if (green + 50 <= 200) {
                    red = 0;
                    green += 50;
                } else if (blue + 50 <= 200) {
                    red = 0;
                    green = 0;
                    blue += 50;
                }
                colorsForName[userName] = 'rgb(' + red + ', ' + green + ', ' + blue + ')'
            }
        }
        return colorsForName[userName];
    }
}
