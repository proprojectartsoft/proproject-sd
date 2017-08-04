angular.module($APP.name).controller('ProjectDiaryCtrl', ProjectDiaryCtrl)


ProjectDiaryCtrl.$inject = ['$rootScope', '$ionicPopup', '$timeout', '$state', '$stateParams', '$indexedDB', '$scope', '$filter', 'SettingService', 'SiteDiaryService', 'AttachmentsService', 'SyncService'];

function ProjectDiaryCtrl($rootScope, $ionicPopup, $timeout, $state, $stateParams, $indexedDB, $scope, $filter, SettingService, SiteDiaryService, AttachmentsService, SyncService) {

    var vm = this;
    vm.go = go;
    vm.saveCreate = saveCreate;
    vm.toggle = toggle;
    vm.saveEdit = saveEdit;
    vm.setCreatedDateFor = setCreatedDateFor;
    vm.setSummary = setSummary;
    vm.createInit = localStorage.getObject('sd.diary.create');
    vm.cancelEdit = false;
    vm.local = {};
    vm.local.data = {};
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.projectId = localStorage.getObject('projectId');
    vm.diaryStateId = $stateParams.id;
    vm.edit = localStorage.getObject('editMode');
    $timeout(function() {
        vm.seen = localStorage.getObject('sd.seen');
    })

    if ($stateParams.id) {
        if ($stateParams.id === 'offline') {
            var offDiary = localStorage.getObject('diaryToSync');
            //TODO:

            vm.create = offDiary.data;
            vm.created_for_date = (vm.create.created_for_date != 0) && vm.create.created_for_date || '';
            vm.summary = vm.create.summary;
            localStorage.setObject('sd.diary.create', vm.create);
        } else {
            localStorage.setObject('diaryId', $stateParams.id);
            vm.enableCreate = false;
            if (vm.edit) {
                vm.create = localStorage.getObject('sd.diary.create');
                vm.created_for_date = (vm.create.created_for_date != 0) && vm.create.created_for_date || '';
                vm.summary = vm.create.summary;
            } else {
                $indexedDB.openStore('projects', function(store) {
                    vm.projectId = parseInt(vm.projectId);
                    store.find(vm.projectId).then(function(e) {
                        vm.diaries = e.value.diaries;
                        angular.forEach(vm.diaries, function(diary) {
                            if (diary.id == $stateParams.id) {
                                vm.created_for_date = (diary.created_for_date != 0) && diary.created_for_date || '';
                                localStorage.setObject('sd.diary.create', diary.data);
                                vm.summary = diary.data ? diary.data.summary : '';
                            }
                        })
                    });
                });
                AttachmentsService.get_attachments($stateParams.id).then(function(result) { //TODO:
                    var att = {
                        pictures: result
                    }
                    localStorage.setObject('sd.attachments', att);
                });
            }
        }
    } else {
        vm.enableCreate = true;
        localStorage.setObject('diaryId', false);
        if (vm.createInit === null) {
            vm.createInit = {
                created_for_date: '',
                summary: '',
                weather: {},
                contract_notes: {},
                site_notes: {},
                site_attendance: {},
                incidents: [],
                plant_and_material_used: [],
                goods_received: [],
                oh_and_s: [],
                comments: []
            };
            vm.createInit.site_attendance.staffs = [];
            vm.createInit.site_attendance.contractors = [];
            vm.createInit.site_attendance.visitors = [];
            vm.att = {
                pictures: []
            }
            localStorage.setObject('sd.attachments', vm.att);
            localStorage.setObject('sd.diary.create', vm.createInit);
        }
        vm.created_for_date = vm.createInit.created_for_date;
        vm.summary = vm.createInit.summary;
    }

    vm.diaryId = localStorage.getObject('diaryId');

    function addSiteDiaryToDB(syncPopup) {
        vm.create = localStorage.getObject('sd.diary.create');
        vm.create.date = new Date().getTime();
        vm.create.project_id = localStorage.getObject('projectId');
        SiteDiaryService.add_diary(vm.create)
            .success(function(result) {
                var attachments = localStorage.getObject('sd.attachments');
                var attToAdd = [],
                    attToAddAsNew = [];
                angular.forEach(attachments.pictures, function(value) {
                    if (!value.path) {
                        value.site_diary_id = result.id;
                        attToAdd.push(value);
                    } else if (!vm.enableCreate && vm.edit) {
                        delete value.id;
                        value.base_64_string = '';
                        value.site_diary_id = result.id;
                        attToAddAsNew.push(value);
                    }
                });
                var uploadAttachments = AttachmentsService.upload_attachments([...attToAdd, ...attToAddAsNew]).then(function(result) {}); //TODO:
                if (attachments.toBeUpdated && attachments.toBeUpdated.length != 0) {
                    angular.forEach(attachments.toBeUpdated, function(att) {
                        AttachmentsService.update_attachments(att).then(function(result) {})
                    })
                }

                var deleteAttachments;
                if (attachments.toBeDeleted) {
                    deleteAttachments = AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result) {});
                }
                angular.forEach(vm.create.comments, function(value) {
                    var request = {
                        site_diary_id: result.id,
                        comment: value.comment,
                    };
                    SiteDiaryService.add_comments(request).success(function(result) {});
                })
                var sync = SyncService.sync().then(function() {
                    $('.create-btn').attr("disabled", false);
                    vm.go('project');
                })

                Promise.all([uploadAttachments, deleteAttachments, sync]).then(syncPopup.close);
            }).error(function(response) {
                var attStorage = localStorage.getObject('sd.attachments');

                var diariesToSync = localStorage.getObject('diariesToSync') || [];
                var diary = {
                    data: vm.create
                }
                if (attStorage) {
                    diary.attachments = attStorage;
                }
                diariesToSync.push(diary);
                localStorage.setObject('diariesToSync', diariesToSync);




                // vm.diaryToSync = {
                //     data: vm.create
                // };
                // if (attStorage) {
                //     vm.diaryToSync.attachments = attStorage;
                // }
                // localStorage.setObject('diaryToSync', vm.diaryToSync);
                //



                syncPopup.close();
                var offlinePopup = $ionicPopup.alert({
                    title: "You are offline",
                    template: "<center>You can sync your data when online</center>",
                    content: "",
                    buttons: [{
                        text: 'Ok',
                        type: 'button-positive',
                        onTap: function(e) {
                            offlinePopup.close();
                        }
                    }]
                });
                $('.create-btn').attr("disabled", false);
                vm.go('project');
            });
    }

    function saveCreate() {
        $('.create-btn').attr("disabled", true);
        var syncPopup = $ionicPopup.show({
            title: 'Submitting',
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });
        // if (navigator.onLine && localStorage.getObject('diaryToSync')) {
        if (navigator.onLine && localStorage.getObject('diariesToSync')) {

            SyncService.addDiariesToSync().then(function() {
                addSiteDiaryToDB(syncPopup)
            })
        } else {
            addSiteDiaryToDB(syncPopup);
        }
    }

    function saveEdit() {
        if (!navigator.onLine) {
            var syncPopup = $ionicPopup.show({
                title: 'You are offline',
                template: "<center>You can edit Site Diaries while online.</center>",
                content: "",
                buttons: []
            });
            return;
        }
        var syncPopup = $ionicPopup.show({
            title: 'Submitting',
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });
        $('.save-btn').attr("disabled", true);
        vm.edit = false;
        localStorage.setObject('editMode', vm.edit);
        vm.create = localStorage.getObject('sd.diary.create');
        var updateDiary = SiteDiaryService.update_diary(vm.create).success(function(result) {
            vm.go('project');
        }).error(function(err) {
            var errPopup = $ionicPopup.show({
                title: "Error",
                template: '<span>An unexpected error occured and Site Diary could not be updated.</span>',
                buttons: [{
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function(e) {
                        errPopup.close();
                    }
                }]
            });
        })
        angular.forEach(localStorage.getObject('sd.comments'), function(comment) {
            SiteDiaryService.add_comments(comment)
                .success(function(result) {
                    localStorage.setObject('sd.comments', []);
                }).error(function(err) {
                    localStorage.setObject('sd.comments', []);
                })
        })
        var attachments = localStorage.getObject('sd.attachments');
        var attToAdd = [];
        if (attachments !== null) {
            angular.forEach(attachments.pictures, function(value) {
                if (!value.path) {
                    attToAdd.push(value);
                }
            });
            var uploadAttachments = AttachmentsService.upload_attachments(attToAdd).then(function(result) {
                console.log(result);
            });

            var updateAttachments = [];
            if (attachments.toBeUpdated && attachments.toBeUpdated.length != 0) {
                angular.forEach(attachments.toBeUpdated, function(att) {
                    updateAttachments.push(AttachmentsService.update_attachments(att).then(function(result) {
                        console.log(result);
                    }));
                })
            }

            var deleteAttachments;
            if (attachments.toBeDeleted) {
                deleteAttachments = AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result) {
                    console.log(result);
                });
            }
        }
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.created_for_date = vm.create.created_for_date;
        diary.data.summary = vm.create.summary;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
        localStorage.setObject('initialProj', localStorage.getObject('currentProj'));
        $('.save-btn').attr("disabled", false);

        Promise.all([updateDiary, uploadAttachments, updateAttachments, deleteAttachments]).then(syncPopup.close);
    }

    function setCreatedDateFor() {
        var create = localStorage.getObject('sd.diary.create');
        create.created_for_date = new Date(vm.created_for_date).getTime();
        localStorage.setObject('sd.diary.create', create);
    }

    function setSummary() {
        var summaryPopup = $ionicPopup.show({
            title: "Site Diary Summary",
            template: '<textarea rows="5" class="summary-textarea" ng-model="vm.summary" placeholder="Please add any summary of the days work you have here."></textarea>',
            content: "",
            cssClass: 'summary-popup',
            scope: $scope,
            buttons: [{
                text: 'Save',
                type: 'button-positive',
                onTap: function(e) {
                    var create = localStorage.getObject('sd.diary.create');
                    create.summary = vm.summary;
                    localStorage.setObject('sd.diary.create', create);
                    if (!vm.edit && !vm.enableCreate) {
                        saveSummary(create);
                    }
                    summaryPopup.close();
                }
            }, {
                text: 'Cancel',
            }]
        });
    }

    function saveSummary(create) {
        if (!navigator.onLine) {
            var syncPopup = $ionicPopup.show({
                title: 'You are offline',
                template: "<center>You can edit Site Diaries while online.</center>",
                content: "",
                buttons: []
            });
            return;
        }
        var syncPopup = $ionicPopup.show({
            title: 'Submitting',
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });

        SiteDiaryService.update_diary(create).success(function(result) {
            // vm.go('project');
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            diary.created_for_date = create.created_for_date;
            diary.data.summary = create.summary;
            localStorage.setObject('currentProj', proj);
            saveChanges(localStorage.getObject('currentProj'));
            localStorage.setObject('initialProj', localStorage.getObject('currentProj'));
            syncPopup.close();
        }).error(function(err) {
            var errPopup = $ionicPopup.show({
                title: "Error",
                template: '<span>An unexpected error occured and Site Diary could not be updated.</span>',
                buttons: [{
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function(e) {
                        errPopup.close();
                    }
                }]
            });
        })
    }

    function toggle() {
        if (!navigator.onLine) {
            var syncPopup = $ionicPopup.show({
                title: 'You are offline',
                template: "<center>You can edit Site Diaries while online.</center>",
                content: "",
                buttons: []
            });
            return;
        }
        vm.edit = !vm.edit;
        localStorage.setObject('editMode', vm.edit);
        if (!vm.edit) {
            localStorage.setObject('currentProj', localStorage.getObject('initialProj'));
        }
    }

    function go(predicate, id) {
        if (predicate === 'project') {
            localStorage.setObject('currentProj', localStorage.getObject('initialProj'));
            $state.go('app.' + predicate, {
                id: vm.projectId
            });
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }

    function saveChanges(project) {
        localStorage.setObject('sd.seen', {});
        $indexedDB.openStore('projects', function(store) {
            store.upsert(project).then(
                function(e) {},
                function(err) {
                    var offlinePopup = $ionicPopup.alert({
                        title: "Unexpected error",
                        template: "<center>An unexpected error occurred while trying to update Site Diary.</center>",
                        content: "",
                        buttons: [{
                            text: 'Ok',
                            type: 'button-positive',
                            onTap: function(e) {
                                offlinePopup.close();
                            }
                        }]
                    });
                }
            )
        })
    }
}
