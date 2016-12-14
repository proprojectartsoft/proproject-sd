angular.module($APP.name).controller('ProjectDiariesCtrl', ProjectDiariesCtrl)

ProjectDiariesCtrl.$inject = ['$scope', '$timeout', '$ionicModal', '$ionicPopup', '$state', '$stateParams', 'SiteDiaryService', 'SettingService', 'SharedService'];

function ProjectDiariesCtrl($scope, $timeout, $ionicModal, $ionicPopup, $state, $stateParams, SiteDiaryService, SettingService, SharedService) {
    var vm = this;
    vm.showDiary = showDiary;
    vm.backDiary = backDiary;
    vm.togglePlus = togglePlus;
    vm.go = go;
    vm.deleteDiary = deleteDiary;

    localStorage.setObject('sd.diary.create', null);
    localStorage.setObject('editMode', null);
    SettingService.clearWeather();
    localStorage.setObject('diaryId', null);
    localStorage.setObject('sd.attachments',null);
    localStorage.setObject('projectId', $stateParams.id);

    vm.filter = {};
    vm.shareId = {};
    vm.state = '';
    vm.show = false;
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
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
    }]
    SiteDiaryService.list_diaries($stateParams.id).then(function(result) {
        vm.diaries = result;
    })
    SiteDiaryService.list_diaries($stateParams.id).then(function(result) {
        vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.diaryModal = popover;
        });
        vm.diary = result;
    })

    $scope.filter = {};
    $scope.importContact = function (id) {
            $timeout(function () {
                navigator.contacts.pickContact(function (contact) {
                    if (contact.emails) {
                        $scope.filter.email = contact.emails[0].value;
                        $timeout(function () {
                            var alertPopupA = SecuredPopups.show('alert', {
                                template: '<input type="email" ng-model="filter.email">',
                                title: 'Share form',
                                subTitle: 'Please insert an email address',
                                scope: $scope,
                                buttons: [
                                    {text: '<i class="ion-person-add"></i>',
                                        onTap: function (e) {
                                            $scope.importContact(id);
                                        }
                                    },
                                    {text: 'Cancel',
                                        onTap: function (e) {
                                            $ionicListDelegate.closeOptionButtons();
                                        }
                                    },
                                    {
                                        text: 'Send',
                                        type: 'button-positive',
                                        onTap: function (e) {
                                            if ($scope.filter.email) {
                                                var alertPopupB = SecuredPopups.show('alert', {
                                                    title: "Sending email",
                                                    template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                                                    content: "",
                                                    buttons: []
                                                });
                                                ShareService.form.create(id, $scope.filter.email).then(function (response) {
                                                    alertPopupB.close();
                                                    if (response.message === "Form shared") {
                                                        $scope.filter.email = "";
                                                        var alertPopupC = SecuredPopups.show('alert', {
                                                            title: 'Share',
                                                            template: 'Email sent.'
                                                        });
                                                    } else {
                                                        $scope.filter.email = "";
                                                        var alertPopupC = SecuredPopups.show('alert', {
                                                            title: 'Share',
                                                            template: 'Form already shared to this user.'
                                                        });
                                                    }
                                                });

                                            } else {
                                                var alertPopupC = SecuredPopups.show('alert', {
                                                    title: 'Share',
                                                    template: 'Please insert a valid value for email.'
                                                });
                                            }
                                        }
                                    }
                                ]
                            });
                        });
                    }
                }, function (err) {
                });
            });
        }

    $scope.showPopup = function(predicate) {
        $scope.data = {}
        var myPopup = $ionicPopup.show({
            template: '<input type = "email" ng-model = "data.model">',
            title: 'Share site diary',
            subTitle: 'Please insert an email address',
            scope: $scope,

            buttons: [{
                text: 'Cancel'
            }, {
                text: '<b>Send</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.model) {
                        e.preventDefault();
                    } else {
                        return $scope.data.model;
                    }
                }
            }, {
                text: '<i class="ion-person-add"></i>',
                        onTap: function (e) {
                            $scope.importContact(predicate.id);
                        }
            }, ]
        });

        myPopup.then(function(res) {
            console.log('Tapped!', res);
            if (res) {
                var alertPopup1 = $ionicPopup.alert({
                    title: "Sending email",
                    template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                    content: "",
                    buttons: []
                });
                alertPopup1.then(function(res) {
                });
                SharedService.share_diary(predicate.id, res).then(function(result) {
                    console.log(result)
                    alertPopup1.close();
                    if (result.message === "Site diary Shared!") {
                        res = "";
                        var alertPopup = $ionicPopup.alert({
                            title: 'Share',
                            template: 'Email sent.'
                        });
                        alertPopup.then(function(res) {
                            // Custom functionality....
                        });
                    } else {
                        res = "";
                        var alertPopup = $ionicPopup.alert({
                            title: 'Share',
                            template: 'Form already shared to this user.'
                        });
                        alertPopup.then(function(res) {
                            // Custom functionality....
                        });
                    }
                })
            }
        });
    };

    function deleteDiary(id) {
        SiteDiaryService.delete_diary(id).then(function(result) {
            SiteDiaryService.list_diaries($stateParams.id).then(function(result) {
                vm.diaries = result;
            })
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
}
