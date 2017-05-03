angular.module($APP.name).controller('ProjectDiaryCtrl', ProjectDiaryCtrl)


ProjectDiaryCtrl.$inject = ['$rootScope', '$ionicPopup', '$timeout', '$state', '$stateParams', '$indexedDB', '$scope', 'SettingService', 'SiteDiaryService', 'AttachmentsService', 'SyncService'];

function ProjectDiaryCtrl($rootScope, $ionicPopup, $timeout, $state, $stateParams, $indexedDB, $scope, SettingService, SiteDiaryService, AttachmentsService, SyncService) {

    var vm = this;
    vm.go = go;
    vm.saveCreate = saveCreate;
    vm.toggle = toggle;
    vm.saveEdit = saveEdit;
    vm.createInit = localStorage.getObject('sd.diary.create');
    vm.cancelEdit = false;
    vm.local = {};
    vm.local.data = {};
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.projectId = localStorage.getObject('projectId');
    vm.diaryStateId = $stateParams.id

    vm.created_for_date = '';
    vm.edit = localStorage.getObject('editMode');

    if ($stateParams.id) {
        if ($stateParams.id === 'offline') {
            var offDiary = localStorage.getObject('diaryToSync');
            vm.create = offDiary.data;
            localStorage.setObject('sd.diary.create', vm.create);
        } else {
            localStorage.setObject('diaryId', $stateParams.id);
            vm.enableCreate = false;
            if (vm.edit) {
                vm.create = localStorage.getObject('sd.diary.create');
            } else {
                $indexedDB.openStore('projects', function(store) {
                    vm.projectId = parseInt(vm.projectId);
                    store.find(vm.projectId).then(function(e) {
                        vm.diaries = e.value.diaries;
                        angular.forEach(vm.diaries, function(diary) {
                            if (diary.id == $stateParams.id) {
                                localStorage.setObject('sd.diary.create', diary.data);
                            }
                        })
                    });
                });
                AttachmentsService.get_attachments($stateParams.id).then(function(result) {
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
                weather: {},
                contract_notes: {},
                site_notes: {},
                site_attendance: {},
                incidents: [],
                plant_and_material_used: [],
                goods_received: [],
                oh_and_s: []
            };
            vm.createInit.site_attendance.staffs = [];
            vm.createInit.site_attendance.contractors = [];
            vm.createInit.site_attendance.visitors = [];
            vm.comments = [];
            vm.att = {
                pictures: []
            }
            localStorage.setObject('sd.attachments', vm.att)
            localStorage.setObject('sd.comments', vm.comments)
            localStorage.setObject('sd.diary.create', vm.createInit)
        }
    }

    vm.diaryId = localStorage.getObject('diaryId');

    function saveCreate() {
        vm.create = localStorage.getObject('sd.diary.create');
        vm.create.date = new Date().getTime();
        // vm.create.created_for_date = vm.created_for_date; TODO:
        vm.create.summary = "Please"
        vm.create.project_id = localStorage.getObject('projectId');
        SiteDiaryService.add_diary(vm.create)
            .success(function(result) {
                var attachments = localStorage.getObject('sd.attachments');
                var attToAdd = [];
                angular.forEach(attachments.pictures, function(value) {
                    if (!value.path) {
                        value.site_diary_id = result.data.id;
                        attToAdd.push(value);
                    }
                });
                AttachmentsService.upload_attachments(attToAdd).then(function(result) {
                    console.log(result);
                });
                if (attachments.toBeDeleted) {
                    AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result) {
                        console.log(result);
                    });
                }
                vm.local.data.comments = localStorage.getObject('sd.comments');
                angular.forEach(vm.local.data.comments, function(value) {
                    var request = {
                        site_diary_id: result.data.id,
                        comment: value,
                    };
                    SiteDiaryService.add_comments(request).success(function(result) {});
                })
                SyncService.sync().then(function() {
                    vm.go('project');
                })
            }).error(function(response) {
                var attStorage = localStorage.getObject('sd.attachments');
                var commStorage = localStorage.getObject('sd.comments');
                vm.diaryToSync = {
                    data: vm.create
                };
                if (attStorage) {
                    vm.diaryToSync.attachments = attStorage;
                }
                if (commStorage) {
                    vm.diaryToSync.comments = commStorage;
                }
                localStorage.setObject('diaryToSync', vm.diaryToSync);
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
                vm.go('project');
            });

    }

    function saveEdit() {
        vm.edit = false;
        localStorage.setObject('editMode', vm.edit);
        vm.create = localStorage.getObject('sd.diary.create');

        // vm.create.created_for_date = vm.created_for_date; TODO
        SiteDiaryService.update_diary(vm.create).then(function(result) {
            vm.go('project');
        })
        var attachments = localStorage.getObject('sd.attachments');
        var attToAdd = [];
        angular.forEach(attachments.pictures, function(value) {
            if (!value.path) {
                attToAdd.push(value);
            }
        });
        AttachmentsService.upload_attachments(attToAdd).then(function(result) {
            console.log(result);
        });
        if (attachments.toBeDeleted) {
            AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result) {
                console.log(result);
            });
        }

        saveChanges(localStorage.getObject('currentProj'));
        localStorage.setObject('initialProj', localStorage.getObject('currentProj'));
    }

    function toggle() {
        vm.edit = !vm.edit;
        localStorage.setObject('editMode', vm.edit);
        if (!vm.edit)
            localStorage.setObject('currentProj', localStorage.getObject('initialProj'));
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
        $indexedDB.openStore('projects', function(store) {
            store.upsert(project).then(
                function(e) {},
                function(err) {
                    var offlinePopup = $ionicPopup.alert({
                        title: "Unexpected error",
                        template: "<center>An unexpected error occurred while trying to update weather.</center>",
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
