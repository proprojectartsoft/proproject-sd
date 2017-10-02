sdApp.controller('ProjectDiariesCtrl', ProjectDiariesCtrl);

ProjectDiariesCtrl.$inject = [
    '$scope',
    '$timeout',
    '$ionicModal',
    '$ionicPopup',
    '$state',
    '$stateParams',
    'orderByFilter',
    '$rootScope',
    '$filter',
    'SettingService',
    'SyncService',
    'PostService',
];

function ProjectDiariesCtrl($scope, $timeout, $ionicModal, $ionicPopup, $state, $stateParams,
    orderBy, $rootScope, $filter, SettingService, SyncService, PostService) {
    var vm = this,
        shares = [];
    vm.showDiary = showDiary;
    vm.backDiary = backDiary;
    vm.togglePlus = togglePlus;
    vm.go = go;
    vm.deleteDiary = deleteDiary;
    vm.showPopup = showPopup;
    sessionStorage.setObject('editMode', null);
    sessionStorage.setObject('diaryId', null);
    sessionStorage.setObject('sd.diary.shares', null);
    vm.myProfile = localStorage.getObject('my_account');
    vm.projectId = parseInt($stateParams.id);
    vm.filter = {};
    vm.state = '';
    vm.show = false;
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.diaries = [];

    // when saving something in a controller (like projectDiaryController) user will be redirected here
    // so don't update the project in that child controller
    SyncService.getProject(vm.projectId, function(proj) {
        if (!proj) return false;
        // if we have a SD in the current scope
        // store that in the DB
        if ($rootScope.currentSD) {
            //store new offline created SD
            if (/^off.*/g.test($rootScope.currentSD.id)) {
                var sd = $filter('filter')(proj.value.site_diaries, {
                    id: $rootScope.currentSD.id
                });
                //SD not already in indexedDB
                if (!sd || sd && !sd.length) {
                    proj.value.site_diaries = proj.value.site_diaries || [];
                    proj.value.site_diaries.push($rootScope.currentSD);
                }
            } else {
                //get the modified diary and store changes
                for (var i = 0; i < proj.value.site_diaries.length; i++) {
                    var sdO = proj.value.site_diaries[i];
                    if (sdO.id === $rootScope.currentSD.id &&
                        JSON.stringify(sdO) !== JSON.stringify($rootScope.currentSD)) {
                        proj.value.site_diaries[i] = angular.copy($rootScope.currentSD);
                    }
                }
            }
        }
        SyncService.setProjects([proj], function() {
            $rootScope.currentSD = false;
            //order diaries by date
            vm.diaries = orderBy(proj.value.site_diaries, 'date', true);
            //get the number of SDs
            $rootScope.diariesLength = vm.diaries.length;
            $rootScope.projectSettings = {};
            angular.forEach(proj.value.project_settings, function(sett) {
              $rootScope.projectSettings[sett.name] = sett.value;
            })
            SettingService.get_colors().then(function(colorList) {
                var colorsLength = Object.keys(colorList).length;
                //store colors
                angular.forEach(vm.diaries, function(diary) {
                    var colorId = (parseInt(vm.myProfile.customer_id + "" + diary.user_id)) % colorsLength;
                    diary.backColor = colorList[colorId].backColor;
                    diary.foreColor = colorList[colorId].foreColor;
                })
            })
        });
    }, function(err) {
        SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
    });

    vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.diaryModal = popover;
    });

    function showPopup(predicate) {
        var popup = $ionicPopup.show(createPopup(predicate.id));
    }

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
                text: 'Cancel'
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

            PostService.post({
                url: 'sharesitediary',
                method: 'POST',
                params: {
                    siteDiaryId: id,
                    email: res
                },
                data: {}
            }, function(result) {
                if (result.message === "Site diary Shared!") {
                    res = "";
                    var alertPopup = $ionicPopup.alert({
                        title: 'Share',
                        template: 'Email sent.'
                    });
                    alertPopup.then(function(res) {});
                }
                sessionStorage.setObject('sd.diary.shares', null);
            }, function(error) {
                if (err.status === 422) {
                    res = "";
                    $ionicPopup.alert({
                        title: 'Share',
                        template: 'Form already shared to this user.'
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Share',
                        template: 'An unexpected error occured while sending the e-mail.'
                    });
                }
            }, alertPopup1)
        } else {
            $ionicPopup.alert({
                title: 'Share',
                template: 'The email will be sent once you go online.'
            });
            shares.push({
                id: id,
                res: res
            });
            sessionStorage.setObject('sd.diary.shares', shares);
        }
    }

    function importContact(id) {
        $timeout(function() {
            navigator.contacts.pickContact(function(contact) {
                if (contact.emails) {
                    vm.filter.email = contact.emails[0].value;
                    $timeout(function() {
                        $ionicPopup.show(createPopup(id));
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Share',
                        template: "No e-mail address was found. Please enter one manually.",
                    });
                    // var alertPopup1 = $ionicPopup.alert({
                    //     title: 'Share',
                    //     template: "",
                    //     content: "No e-mail address was found. Please enter one manually.",
                    //     buttons: [{
                    //         text: 'OK',
                    //         type: 'button-positive',
                    //         onTap: function(e) {
                    //             alertPopup1.close();
                    //             $ionicPopup.show(createPopup(id));
                    //         }
                    //     }]
                    // });
                }
            }, function(err) {
                $ionicPopup.alert({
                    title: 'Import contact failed',
                    template: "An unexpected error occured while trying to import contact",
                })
                $timeout(function() {
                    $ionicPopup.show(createPopup(id));
                });
            });
        });
    }

    function deleteDiary(id) {
        $('.delete-btn').attr("disabled", true);
        $('.item-content').css('transform', '');
        var syncPopup = $ionicPopup.show({
            title: "Removing Site Diary",
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });
        PostService.post({
            url: 'sitediary?id=' + id,
            method: 'DELETE',
            data: {}
        }, function(result) {
            SyncService.addDiariesToSync().then(function() {
                SyncService.sync().then(function() {
                    $('.delete-btn').attr("disabled", false);
                    syncPopup.close();
                    vm.diaries.splice(jQuery.inArray($filter('filter')(vm.diaries, {
                        id: id
                    })[0], vm.diaries), 1);
                }, function(reason) {
                    SettingService.close_all_popups();
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: "<center>" + reason + "</center>"
                    });
                    alertPopup.then(function(res) {
                        // syncPopup.close();
                        return false;
                    });
                })
            });
        }, function(error) {
            // syncPopup.close();
            SettingService.close_all_popups();
            $ionicPopup.alert({
                title: 'You are offline',
                template: "<center>You can remove Site Diaries when online.</center>",
            })
            // var errPopup = $ionicPopup.show({
            //     title: "You are offline",
            //     template: "<center>You can remove Site Diaries when online.</center>",
            //     content: "",
            //     buttons: [{
            //         text: 'Ok',
            //         type: 'button-positive',
            //         onTap: function(e) {
            //             errPopup.close();
            //         }
            //     }]
            // });
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
        $rootScope.go('app.' + predicate, {
            id: id
        });
        vm.diaryModal.hide();
    }
}
