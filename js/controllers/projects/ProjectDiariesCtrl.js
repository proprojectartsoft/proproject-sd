sdApp.controller('ProjectDiariesCtrl', ProjectDiariesCtrl)

ProjectDiariesCtrl.$inject = [
    '$scope',
    '$timeout',
    '$ionicModal',
    '$ionicPopup',
    '$state',
    '$stateParams',
    'SiteDiaryService',
    'SettingService',
    'SharedService',
    'SyncService',
    'orderByFilter',
    '$rootScope',
    '$filter',
];

function ProjectDiariesCtrl($scope, $timeout, $ionicModal, $ionicPopup, $state, $stateParams, SiteDiaryService, SettingService, SharedService, SyncService, orderBy, $rootScope, $filter) {
    var vm = this,
        shares = [];
    vm.showDiary = showDiary;
    vm.backDiary = backDiary;
    vm.togglePlus = togglePlus;
    vm.go = go;
    vm.deleteDiary = deleteDiary;
    vm.showPopup = showPopup;
    vm.getSdTitleColor = getSdTitleColor;
    sessionStorage.setObject('editMode', null);
    sessionStorage.setObject('diaryId', null);
    sessionStorage.setObject('sd.diary.shares', null);
    sessionStorage.setObject('sd.seen', {});
    SettingService.clearWeather();
    vm.projectId = parseInt($stateParams.id);
    vm.filter = {};
    vm.state = '';
    vm.show = false;
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.diaries = [];
    $rootScope.currentSD = null;
    $rootScope.backupSD = null;

    SyncService.getProject(vm.projectId, function(projArr) {
        var proj = projArr[0];
        angular.forEach(proj.value.diaries, function(value, key) {
            proj.value.diaries[key].color = getSdTitleColor(value.userName)
        });
        //order diaries by date
        vm.diaries = orderBy(proj.value.diaries, 'date', true);
        //update the color for every SD
        SyncService.setProjects([proj], function() {
            console.log('Diaries color stored');
        });
    }, function(err) {
        SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
    })

    vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.diaryModal = popover;
    });

    function showPopup(predicate) {
        var popup = $ionicPopup.show(createPopup(predicate.id));
    };

    function createPopup(id) {
        return {
            template: '<input type="email" ng-model="vm.filter.email">',
            title: 'Share form',
            subTitle: 'Please enter a valid e-mail address.',
            scope: $scope,
            buttons: [{
                text: '<i class="ion-person-add"></i>',
                onTap: function(e) {
                    importContact(id);
                }
            }, {
                text: 'Cancel',
            }, {
                text: 'Send',
                type: 'button-positive',
                onTap: function(e) {
                    if (!vm.filter.email) {
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
                        sendEmail(vm.filter.email, id);
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

    function importContact(id) {
        $timeout(function() {
            navigator.contacts.pickContact(function(contact) {
                if (contact.emails) {
                    vm.filter.email = contact.emails[0].value;
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
    // $scope.data = {};

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

    function getSdTitleColor(userName) {
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
