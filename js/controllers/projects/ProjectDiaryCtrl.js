sdApp.controller('ProjectDiaryCtrl', ProjectDiaryCtrl);

ProjectDiaryCtrl.$inject = ['$rootScope', '$ionicPopup', '$timeout', '$state', '$stateParams', '$scope', '$filter', 'SettingService', 'SiteDiaryService', 'AttachmentsService', 'SyncService'];

function ProjectDiaryCtrl($rootScope, $ionicPopup, $timeout, $state, $stateParams, $scope, $filter, SettingService, SiteDiaryService, AttachmentsService, SyncService) {

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
    vm.diaryStateId = $stateParams.id;
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.projectId = sessionStorage.getObject('projectId');
    vm.edit = sessionStorage.getObject('editMode');
    vm.diaryId = sessionStorage.getObject('diaryId');

    $timeout(function() {
        vm.seen = sessionStorage.getObject('sd.seen');
    });

    if (vm.diaryStateId) {
        //enter existing SD
        sessionStorage.setObject('diaryId', vm.diaryStateId);
        vm.enableCreate = false;
        if (vm.edit) {
            vm.created_for_date = ($rootScope.currentSD.created_for_date !== 0) && $rootScope.currentSD.created_for_date || '';
            vm.summary = $rootScope.currentSD.summary;
        } else {
            //visualize SD
            SyncService.getProject(vm.projectId, function(proj) {
                var diary = $filter('filter')(proj.value.site_diaries, {
                    id: vm.diaryStateId
                })[0];
                vm.created_for_date = (diary.created_for_date !== 0) && diary.created_for_date || '';
                vm.summary = diary ? diary.summary : '';
                //store as temp
                $rootScope.currentSD = diary;
                $rootScope.backupSD = angular.copy($rootScope.currentSD);
            }, function(err) {
                SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
            })
        }
    } else {
        //create new SD
        vm.enableCreate = true;
        sessionStorage.setObject('diaryId', false);
        if (!$rootScope.currentSD || $rootScope.currentSD && $rootScope.currentSD === null) {
            //store temp
            $rootScope.currentSD = {
                created_for_date: '',
                summary: '',
                weather: {},
                contract_notes: {},
                site_notes: {},
                site_attendance: {
                    staffs: [],
                    contractors: [],
                    visitors: []
                },
                incidents: [],
                plant_and_material_used: [],
                goods_received: [],
                oh_and_s: [],
                comments: [],
                attachments: {
                    pictures: []
                }
            };
        }
        vm.created_for_date = $rootScope.currentSD.created_for_date;
        vm.summary = $rootScope.currentSD.summary;
    }

    function addSiteDiaryToDB(syncPopup) {
        var attachments = [],
            comments = [];
        angular.copy($rootScope.currentSD.attachments, attachments);
        angular.copy($rootScope.currentSD.comments, comments);
        //add and remove fields to conform to the format required on server
        prepareSDForServer();
        console.log($rootScope.currentSD);
        SiteDiaryService.add_diary($rootScope.currentSD)
            .success(function(result) {
                //add comments for SD
                angular.forEach(comments, function(value) {
                    var request = {
                        site_diary_id: result.id,
                        comment: value.comment
                    };
                    SiteDiaryService.add_comments(request).success(function(result) {});
                });
                //update attachments
                angular.forEach(attachments.toBeUpdated, function(att) {
                    AttachmentsService.update_attachments(att).then(function(result) {})
                })
                var deleteAttachments, uploadAttachments;
                //prepare the attachments array to conform to format required by server
                angular.forEach(attachments.pictures, function(value) {
                    if (!value.path) {
                        value.site_diary_id = result.id;
                    } else if (!vm.enableCreate && vm.edit) {
                        delete value.id;
                        value.base_64_string = '';
                        value.site_diary_id = result.id;
                    }
                });
                if (attachments.pictures) {
                    uploadAttachments = AttachmentsService.upload_attachments(attachments.pictures).then(function(result) {});
                }
                if (attachments.toBeDeleted) {
                    deleteAttachments = AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result) {});
                }
                Promise.all([uploadAttachments, deleteAttachments]).then(function(res) {
                    SyncService.sync().then(function() {
                        $('.create-btn').attr("disabled", false);
                        syncPopup.close();
                        vm.go('project');
                    })
                });
            }).error(function(response) {
                localStorage.setObject('diariesToSync', true);
                //add the new SD to the project's SD list
                SyncService.getProject(vm.projectId, function(proj) { //TODO:do not call getProject again!!!!!
                    $rootScope.currentSD.id = "off" + proj.value.site_diaries.length + 1;
                    $rootScope.currentSD.sd_no = $rootScope.currentSD.id;
                    syncPopup.close();
                    SettingService.show_message_popup("You are offline", "<center>You can sync your data when online</center>");
                    $('.create-btn').attr("disabled", false);
                    vm.go('project');
                }, function(err) {
                    SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
                });
            })
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
        // navigator is offline - stop processing
        if (!navigator.onLine) {
            return SettingService.show_message_popup('You are offline', "<center>You can edit Site Diaries while online.</center>");
        }
        // show the spinner
        var syncPopup = $ionicPopup.show({
            title: 'Submitting',
            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
            content: "",
            buttons: []
        });

        // set edit mode off
        $('.save-btn').attr("disabled", true);
        vm.edit = false;
        sessionStorage.setObject('editMode', vm.edit);

        // method to update the backend
        var updateDiary = SiteDiaryService.update_diary($rootScope.currentSD).success(function(result) {}).error(function(err) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        });

        // method to update comments in the backend
        angular.forEach(sessionStorage.getObject('sd.comments'), function(comment) {
            SiteDiaryService.add_comments(comment)
                .success(function(result) {
                    sessionStorage.setObject('sd.comments', []);
                }).error(function(err) {
                    sessionStorage.setObject('sd.comments', []);
                })
        });

        // method to update the attachments
        var attachments = $rootScope.currentSD.attachments,
            attToAdd = [];
        if (attachments !== null) {
            angular.forEach(attachments.pictures, function(value) {
                if (!value.path) {
                    attToAdd.push(value);
                }
            });
            var uploadAttachments = AttachmentsService.upload_attachments(attToAdd).then(function(result) {});
            var updateAttachments = [];
            if (attachments.toBeUpdated && attachments.toBeUpdated.length !== 0) {
                angular.forEach(attachments.toBeUpdated, function(att) {
                    updateAttachments.push(AttachmentsService.update_attachments(att).then(function(result) {}));
                })
            }

            // method to delete attachments
            var deleteAttachments;
            if (attachments.toBeDeleted) {
                deleteAttachments = AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result) {});
            }
        }
        // run all operations then go back to the page where we come from - there project will be updated
        Promise.all([updateDiary, uploadAttachments, updateAttachments, deleteAttachments]).then(function(res) {
            syncPopup.close();
            vm.go('project');
        });
    }

    function prepareSDForServer() {
        //set date
        $rootScope.currentSD.date = new Date().getTime();
        //set project id
        $rootScope.currentSD.project_id = sessionStorage.getObject('projectId');
        //delete fields used for local purpose
        delete $rootScope.currentSD.backColor;
        delete $rootScope.currentSD.foreColor;
        delete $rootScope.currentSD.id;
        delete $rootScope.currentSD.sd_no;
        delete $rootScope.currentSD.attachments;
        delete $rootScope.currentSD.comments;
    }

    function setCreatedDateFor() {
        $rootScope.currentSD.created_for_date = new Date(vm.created_for_date).getTime();
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
                    $rootScope.currentSD.summary = vm.summary;
                    if (!vm.edit && !vm.enableCreate) {
                        saveSummary($rootScope.currentSD);
                    }
                    summaryPopup.close();
                }
            }, {
                text: 'Cancel'
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
        sessionStorage.setObject('editMode', vm.edit);
        //cancel edit
        if (!vm.edit) {
            //discard changes made on temp SD
            angular.copy($rootScope.backupSD, $rootScope.currentSD);
        }
    }

    function go(predicate, id) {
        if (predicate === 'project') {
            $rootScope.currentSD = null;
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
