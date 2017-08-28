angular.module($APP.name).controller('ProjectDiaryCtrl', ProjectDiaryCtrl)


ProjectDiaryCtrl.$inject = ['$rootScope', '$ionicPopup', '$timeout', '$state', '$stateParams', '$indexedDB', '$scope', '$filter', 'SettingService', 'SiteDiaryService', 'AttachmentsService', 'SyncService', '$q'];

function ProjectDiaryCtrl($rootScope, $ionicPopup, $timeout, $state, $stateParams, $indexedDB, $scope, $filter, SettingService, SiteDiaryService, AttachmentsService, SyncService, $q) {

    var vm = this;
    vm.go = go;
    vm.saveCreate = saveCreate;
    vm.toggle = toggle;
    vm.saveEdit = saveEdit;
    vm.setCreatedDateFor = setCreatedDateFor;
    vm.setSummary = setSummary;
    vm.cancelEdit = false;
    vm.local = {};
    vm.local.data = {};
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.projectId = localStorage.getObject('projectId');
    vm.diaryStateId = $stateParams.id;
    vm.edit = localStorage.getObject('editMode');
    vm.diaryId = localStorage.getObject('diaryId');
    $timeout(function() {
        vm.seen = localStorage.getObject('sd.seen');
    })

    $indexedDB.openStore('projects', function(store) {
        store.find(vm.projectId).then(function(e) {
            vm.createInit = e.temp;
            if ($stateParams.id) {
                // if ($stateParams.id === 'offline') {
                //     var offDiary = localStorage.getObject('diaryToSync');
                //     vm.create = offDiary.data;
                //     vm.created_for_date = (vm.create.created_for_date != 0) && vm.create.created_for_date || '';
                //     vm.summary = vm.create.summary;
                //     // localStorage.setObject('sd.diary.create', vm.create);
                //     //TODO: store as temp in indexedDB
                //
                // } else {
                localStorage.setObject('diaryId', $stateParams.id);
                vm.enableCreate = false;
                if (vm.edit) {
                    vm.create = e.temp;
                    if (vm.create == null || vm.create == {}) {
                        SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                        $state.go('app.home');
                        return;
                    }
                    vm.created_for_date = (vm.create.created_for_date != 0) && vm.create.created_for_date || '';
                    vm.summary = vm.create.summary;
                } else {
                    vm.diaries = e.value.diaries;
                    angular.forEach(vm.diaries, function(diary) {
                        if (diary.id == $stateParams.id) {
                            vm.created_for_date = (diary.created_for_date != 0) && diary.created_for_date || '';
                            //store as temp in indexedDB
                            e.temp = diary.data;
                            store.upsert(e).then(
                                function(e) {},
                                function(err) {}
                            )
                            vm.summary = diary.data ? diary.data.summary : '';
                        }
                    })
                }
            } else {
                vm.enableCreate = true;
                localStorage.setObject('diaryId', false);
                if (!vm.createInit || vm.createInit && vm.createInit === null) {
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
                        comments: [],
                        attachments: {
                            pictures: []
                        }
                    };
                    vm.createInit.site_attendance.staffs = [];
                    vm.createInit.site_attendance.contractors = [];
                    vm.createInit.site_attendance.visitors = [];
                    e.temp = vm.createInit;
                    store.upsert(e).then(
                        function(e) {},
                        function(err) {}
                    )
                }
                vm.created_for_date = vm.createInit.created_for_date;
                vm.summary = vm.createInit.summary;
            }
        });
    });

    function addSiteDiaryToDB(syncPopup) {
        $indexedDB.openStore('projects', function(store) {
            store.find(localStorage.getObject('projectId')).then(function(proj) {
                vm.create = proj.temp;
                //if create is not loaded correctly, redirect to home and try again
                if (vm.create == null || vm.create == {}) {
                    SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                    $state.go('app.home');
                    return;
                }
                vm.create.date = new Date().getTime();
                vm.create.project_id = localStorage.getObject('projectId');
                SiteDiaryService.add_diary(vm.create)
                    .success(function(result) {
                        // var attachments = localStorage.getObject('sd.attachments') || {};
                        var attachments = vm.create.attachments;
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
                        var uploadAttachments = AttachmentsService.upload_attachments([...attToAdd, ...attToAddAsNew]).then(function(result) {});
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
                        var attStorage = vm.create.attachments; //localStorage.getObject('sd.attachments');
                        var diary = {
                            data: vm.create
                        }
                        if (attStorage) {
                            diary.attachments = attStorage;
                        }
                        localStorage.setObject('diariesToSync', true);
                        //add offline information to the new SD
                        diary.id = "off" + proj.value.diaries.length + 1;
                        diary.date = diary.data.date;
                        diary.sdNo = diary.id;
                        diary.created_for_date = diary.data.created_for_date;
                        //add the new SD to the project's SD list
                        if (!proj.value.diaries)
                            proj.value.diaries = [];
                        proj.value.diaries.push(diary);
                        //update the indexedDB
                        store.upsert(proj).then(function(e) {}, function(err) {
                            SettingService.show_message_popup('Error', "<center>An unexpected error occured and SD cannot be displayed until sync.</center>");
                        });
                        syncPopup.close();
                        SettingService.show_message_popup("You are offline", "<center>You can sync your data when online</center>");
                        $('.create-btn').attr("disabled", false);
                        vm.go('project');
                    });
            });
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
            SettingService.show_message_popup('You are offline', "<center>You can edit Site Diaries while online.</center>");
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
        $indexedDB.openStore('projects', function(store) {
            store.find(vm.projectId).then(function(proj) {
                vm.create = proj.temp;
                //if create is not loaded correctly, redirect to home and try again
                if (vm.create == null || vm.create == {}) {
                    SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                    $state.go('app.home');
                    return;
                }
                var updateDiary = SiteDiaryService.update_diary(vm.create).success(function(result) {
                    vm.go('project');
                }).error(function(err) {
                    SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
                })
                angular.forEach(localStorage.getObject('sd.comments'), function(comment) {
                    SiteDiaryService.add_comments(comment)
                        .success(function(result) {
                            localStorage.setObject('sd.comments', []);
                        }).error(function(err) {
                            localStorage.setObject('sd.comments', []);
                        })
                })
                var attachments = vm.create.attachments; //localStorage.getObject('sd.attachments');
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
                //replace the diary in proj.value.diaries with the temp diary
                var diary = $filter('filter')(proj.value.diaries, {
                    id: (vm.diaryId)
                })[0];
                diary.data = vm.create;
                diary.data.summary = vm.create.summary;
                diary.created_for_date = vm.create.created_for_date
                store.upsert(proj).then(function(e) {}, function(err) {});
                $('.save-btn').attr("disabled", false);
                Promise.all([updateDiary, uploadAttachments, updateAttachments, deleteAttachments]).then(syncPopup.close);
            });
        });
    }

    function setCreatedDateFor() {
        $indexedDB.openStore('projects', function(store) {
            store.find(vm.projectId).then(function(proj) {
                var create = proj.temp;
                create.created_for_date = new Date(vm.created_for_date).getTime();
                store.upsert(proj).then(function(e) {}, function(err) {});
            })
        })
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
                    $indexedDB.openStore('projects', function(store) {
                        store.find(vm.projectId).then(function(proj) {
                            var create = proj.temp;
                            create.summary = vm.summary;
                            store.upsert(proj).then(function(e) {}, function(err) {});
                            if (!vm.edit && !vm.enableCreate) {
                                saveSummary(create);
                            }
                            summaryPopup.close();
                        })
                    })
                }
            }, {
                text: 'Cancel',
            }]
        });
    }

    function saveSummary(create) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can edit Site Diaries while online.</center>");
            return;
        }
        var syncPopup = $ionicPopup.show({
            title: 'Submitting',
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });

        SiteDiaryService.update_diary(create).success(function(result) {
            syncPopup.close();
        }).error(function(err) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        })
    }

    function toggle() {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can edit Site Diaries while online.</center>");
            return;
        }
        vm.edit = !vm.edit;
        localStorage.setObject('editMode', vm.edit);
        if (!vm.edit) {
            //discard changes made on temp SD
            $indexedDB.openStore('projects', function(store) {
                store.find(vm.projectId).then(function(e) {
                    var diary = $filter('filter')(e.value.diaries, {
                        id: $stateParams.id
                    })[0];
                    angular.copy(diary.data, e.temp);
                    store.upsert(e).then(
                        function(e) {},
                        function(err) {})
                });
            });
        }
    }

    function go(predicate, id) {
        if (predicate === 'project') {
            $state.go('app.' + predicate, {
                id: vm.projectId
            });
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }
}
