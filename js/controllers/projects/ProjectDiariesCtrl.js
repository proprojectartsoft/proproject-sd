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
    'orderByFilter'
];

function ProjectDiariesCtrl($scope, $timeout, $ionicModal, $ionicPopup, $state, $stateParams, $indexedDB, SiteDiaryService, SettingService, SharedService, SyncService, orderBy) {
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
    localStorage.setObject('sd.attachments', null);
    localStorage.setObject('projectId', $stateParams.id);

    vm.offlineDiary = localStorage.getObject('diaryToSync');
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
    }];

    $indexedDB.openStore('projects', function(store) {
        vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.diaryModal = popover;
        });
        vm.projectId = parseInt($stateParams.id);
        store.find(vm.projectId).then(function(e) {
            localStorage.setObject('currentProj', e);
            console.log($stateParams.id, e);
            vm.diary = e.value.diaries;
            vm.diaries = orderBy(e.value.diaries, 'date', true);
        });
    });

    $scope.filter = {};
    $scope.importContact = function(id) {
        $timeout(function() {
            navigator.contacts.pickContact(function(contact) {
                if (contact.emails) {
                    var alertPopup1 = $ionicPopup.alert({
                        title: "Sending email",
                        template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                        content: "",
                        buttons: []
                    });
                    alertPopup1.then(function(res) {});
                    $scope.filter.email = contact.emails[0].value;
                    SharedService.share_diary(id, $scope.filter.email).then(function(result) {
                        console.log(result);
                        alertPopup1.close();
                        if (result.message === "Site diary Shared!") {
                            res = "";
                            var alertPopup = $ionicPopup.alert({
                                title: 'Share',
                                template: 'Email sent.'
                            });
                            alertPopup.then(function(res) {});
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
        });
    }

    $scope.showPopup = function(predicate) {
        $scope.data = {}
        var myPopup = $ionicPopup.show({
            template: '<input type = "email" ng-model = "data.model">',
            title: 'Share site diary',
            subTitle: 'Please enter a valid e-mail address.',
            scope: $scope,

            buttons: [{
                text: 'Cancel'
            }, {
                text: '<b>Send</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.model) {
                        e.preventDefault();
                        var alertPopup = $ionicPopup.alert({
                            title: "Share",
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
                        return $scope.data.model;
                    }
                }
            }, {
                text: '<i class="ion-person-add"></i>',
                onTap: function(e) {
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
                alertPopup1.then(function(res) {});
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
        console.log(id);
        SiteDiaryService.delete_diary(id).then(function(result) {
            SyncService.sync().then(function() {
                //vm.go('home');
                $state.reload();
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
