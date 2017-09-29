sdApp.controller('ProjectDiaryCtrl', ProjectDiaryCtrl);

ProjectDiaryCtrl.$inject = ['$rootScope', '$ionicPopup', '$timeout', '$state', '$stateParams', '$scope', '$filter', 'SettingService', 'SyncService', 'PostService', '$q'];

function ProjectDiaryCtrl($rootScope, $ionicPopup, $timeout, $state, $stateParams, $scope, $filter,
    SettingService, SyncService, PostService, $q) {
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
    var loadingTemplate = "<center><ion-spinner icon='android'></ion-spinner></center>";

    //store the number of diaries for current projectId
    if (vm.diaryStateId) {
        //enter existing SD
        sessionStorage.setObject('diaryId', vm.diaryStateId);
        vm.enableCreate = false;
        if (vm.edit) {
            //enter edit mode
            vm.created_for_date = ($rootScope.currentSD.created_for_date !== 0) && $rootScope.currentSD.created_for_date || '';
            vm.summary = $rootScope.currentSD.summary;
            //check the subfields having inputed some data
            indicateInputData();
        } else {
            //visualize SD
            SyncService.getProject(vm.projectId, function(proj) {
                setTimeout(function() {
                    $scope.$apply(function() {
                        if (!proj) return false;
                        var diary = $filter('filter')(proj.value.site_diaries, {
                            id: vm.diaryStateId
                        })[0];
                        //copy all attachments into pictures field
                        if (!diary.attachments.pictures)
                            diary.attachments.pictures = angular.copy(diary.attachments);
                        //store as temp
                        $rootScope.currentSD = diary;
                        $rootScope.backupSD = angular.copy($rootScope.currentSD);
                        // display data will be completed later
                        vm.created_for_date = ($rootScope.currentSD.created_for_date !== 0) && $rootScope.currentSD.created_for_date || '';
                        vm.summary = $rootScope.currentSD.summary;
                        //check the subfields having inputed some data
                        indicateInputData();
                    });
                }, 100);
            }, function(err) {
                SettingService.show_message_popup('Error', '<span>Project not found: </span>' + vm.projectId);
            });
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
        //check the subfields having inputed some data
        indicateInputData();
    }

    function indicateInputData() {
        var diary = $rootScope.currentSD;
        $rootScope.indication = {
            weather: false,
            incidents: false,
            attachments: false,
            comments: false,
            site_attendance: false,
            plant_and_material_used: false,
            contract_notes: false,
            site_notes: false,
            goods_received: false,
            oh_and_s: false
        };
        for (var key in diary) {
            if (!diary.hasOwnProperty(key)) continue;
            //not empty array
            if ((Array.isArray(diary[key]) && diary[key].length)) {
                $rootScope.indication[key] = true;
            }
            var field = {};
            switch (key) {
                case "site_attendance":
                    field = diary[key];
                    //at least one subsection is not empty
                    for (var subfield in field) {
                        if (!field.hasOwnProperty(subfield)) continue;
                        if (field[subfield].length) {
                            $rootScope.indication[key] = true;
                            break;
                        }
                    }
                    break;
                case "contract_notes":
                    field = diary[key];
                    //at least one subsection is not null
                    for (var subfield2 in field) {
                        if (!field.hasOwnProperty(subfield2)) continue;
                        if (field[subfield2] !== null) {
                            $rootScope.indication[key] = true;
                            break;
                        }
                    }
                    break;
                case "site_notes":
                    field = diary[key];
                    //at least one subsection is not null
                    for (var subfield3 in field) {
                        if (!field.hasOwnProperty(subfield3)) continue;
                        if (field[subfield3] !== null) {
                            $rootScope.indication[key] = true;
                            break;
                        }
                    }
                    break;
                case "weather":
                    field = diary[key];
                    //at least one subsection is not null or is perfect weather
                    for (var subfield4 in field) {
                        if (!field.hasOwnProperty(subfield4)) continue;
                        if (field[subfield4] && field[subfield4] !== null) {
                            $rootScope.indication[key] = true;
                            break;
                        }
                    }
                    break;
                case "attachments":
                    field = diary[key];
                    //at least one subsection is not empty (pictures, attToUpdate, attToDelete)
                    for (var subfield in field) {
                        if (!field.hasOwnProperty(subfield)) continue;
                        if (field[subfield].length) {
                            $rootScope.indication[key] = true;
                            break;
                        }
                    }
                    break;
            }
        }
    }

    function addSiteDiaryToDB(syncPopup) {
        var attachments = [],
            comments = [];
        angular.copy($rootScope.currentSD.attachments, attachments);
        angular.copy($rootScope.currentSD.comments, comments);
        //add and remove fields to conform to the format required on server
        prepareSDForServer();
        PostService.post({
            url: 'sitediary',
            method: 'POST',
            data: $rootScope.currentSD
        }, function(result) {
            //add comments for SD
            var addComments = function() {
                var def = $q.defer(),
                    comLength = 0;
                if (!comments || comments && !comments.length) {
                    def.resolve();
                }
                angular.forEach(comments, function(value) {
                    comLength++;
                    PostService.post({
                        url: 'sitediary/comment',
                        method: 'POST',
                        data: {
                            site_diary_id: result.data.id,
                            comment: value.comment
                        }
                    }, function(result) {
                        if (comLength >= comments.length) return def.resolve();
                    }, function(error) {
                        if (comLength >= comments.length) return def.resolve();
                    })
                });
                return def.promise;
            };
            //prepare the attachments array to conform to format required by server
            var addAttachments = function() {
                var def = $q.defer(),
                    attLength = 0;
                if (!attachments.pictures || attachments.pictures && !attachments.pictures.length) {
                    def.resolve();
                }
                angular.forEach(attachments.pictures, function(value) {
                    attLength++;
                    //new photo, non existent on server
                    if (value.base_64_string) {
                        value.site_diary_id = result.data.id;
                    } else if (!vm.enableCreate && vm.edit) {
                        //when edit a diary and save as new,there may be photos already stored on server
                        delete value.id;
                        value.base_64_string = '';
                        value.site_diary_id = result.data.id;
                    }
                    delete value.url;
                    PostService.post({
                        url: 'sdattachment/uploadfile',
                        method: 'POST',
                        data: value
                    }, function(result) {
                        if (attLength >= attachments.pictures.length) return def.resolve();
                    }, function(error) {
                        if (attLength >= attachments.pictures.length) return def.resolve();
                    })
                });
                return def.promise;
            };

            var comm = addComments();
            var attachm = addAttachments();

            Promise.all([comm, attachm]).then(function(res) {
                SyncService.sync().then(function() {
                    $('.create-btn').attr("disabled", false);
                    syncPopup.close();
                    $rootScope.currentSD = null;
                    vm.go('project');
                }, function(reason) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: "<center>" + reason + "</center>"
                    });
                    alertPopup.then(function(res) {
                        syncPopup.close();
                        return false;
                    });
                });
            });
        }, function(error) {
            localStorage.setObject('diariesToSync', true);
            //add the new SD to the project's SD list
            $rootScope.currentSD.id = "off" + $rootScope.diariesLength + 1;
            $rootScope.currentSD.sd_no = $rootScope.currentSD.id;
            //restore initial format for attachments and comments field
            $rootScope.currentSD.attachments = attachments.pictures || [];
            $rootScope.currentSD.comments = comments;
            SettingService.close_all_popups();
            syncPopup.close();
            SettingService.show_message_popup("You are offline", "<center>You can sync your data when online</center>");
            $('.create-btn').attr("disabled", false);
            vm.go('project');
        })
    }

    function saveCreate() {
        $('.create-btn').attr("disabled", true);
        var syncPopup = $ionicPopup.show({
            title: 'Submitting',
            template: loadingTemplate,
            content: "",
            buttons: []
        });
        if (navigator.onLine && localStorage.getObject('diariesToSync')) {
            //if online and there is a SD stored while offline, sync the offline SD then add this new one
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
            template: loadingTemplate,
            content: "",
            buttons: []
        });

        // set edit mode off
        $('.save-btn').attr("disabled", true);
        vm.edit = false;
        sessionStorage.setObject('editMode', vm.edit);
        //store attachments and comments
        var attachments = [],
            comments = [];
        angular.copy($rootScope.currentSD.attachments, attachments);
        angular.copy($rootScope.currentSD.comments, comments);
        //delete fields used for local purpose
        delete $rootScope.currentSD.backColor;
        delete $rootScope.currentSD.foreColor;
        delete $rootScope.currentSD.attachments;
        delete $rootScope.currentSD.comments;
        console.log("ProjectDiaryCtrl - saveEdit() - update diary ", $rootScope.currentSD);
        // method to update the backend
        var updateDiary = function() {
            var def = $q.defer();
            PostService.post({
                url: 'sitediary',
                method: 'PUT',
                data: $rootScope.currentSD
            }, function(result) {
                console.log("ProjectDiaryCtrl - saveEdit() - success updateDiary");
                def.resolve();
            }, function(error) {
                console.log("ProjectDiaryCtrl - saveEdit() - error updateDiary");
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
                def.resolve();
            })
            return def.promise;
        }

        // method to upload attachments
        var uploadAttachments = function() {
            var def = $q.defer(),
                count = 0;
            if (attachments !== null && attachments.pictures && attachments.pictures.length) {
                // method to add attachments
                angular.forEach(attachments.pictures, function(value) {
                    count++;
                    //base_64_string is populated only for new attachments
                    //the attachments on server have null base_64_string, but have path field assigned
                    if (value.base_64_string) {
                        delete value.url;
                        delete value.path;
                        PostService.post({
                            url: 'sdattachment/uploadfile',
                            method: 'POST',
                            data: value
                        }, function(result) {
                            if (count >= attachments.pictures.length)
                                def.resolve();
                        }, function(error) {
                            if (count >= attachments.pictures.length)
                                def.resolve();
                        })
                    } else {
                        if (count >= attachments.pictures.length)
                            def.resolve();
                    }
                });
            } else {
                def.resolve();
            }
            return def.promise;
        };

        // method to update attachments in the backend
        var updateAttachments = function() {
            var def = $q.defer(),
                count = 0;
            if (attachments !== null && attachments.toBeUpdated && attachments.toBeUpdated.length) {
                angular.forEach(attachments.toBeUpdated, function(value) {
                    count++;
                    PostService.post({
                        url: 'sdattachment/update',
                        method: 'POST',
                        data: value
                    }, function(result) {
                        if (count >= attachments.pictures.length)
                            def.resolve();
                    }, function(error) {
                        if (count >= attachments.pictures.length)
                            def.resolve();
                    })
                });
            } else {
                def.resolve();
            }
            return def.promise;
        };

        // method to delete attachments
        var deleteAttachments = function() {
            var def = $q.defer();
            if (attachments !== null && attachments.toBeDeleted) {
                PostService.post({
                    url: 'sdattachment',
                    method: 'POST',
                    data: attachments.toBeDeleted
                }, function(result) {
                    def.resolve();
                }, function(error) {
                    def.resolve();
                })
            } else {
                def.resolve();
            }
            return def.promise;
        };

        // method to update comments in the backend
        var addComments = function() {
            var def = $q.defer(),
                count = 0;
            if (!comments || comments && !comments.length)
                def.resolve();
            angular.forEach(comments, function(comment) {
                count++;
                //all new comments do not have an id yet; add them to server
                if (comment.id) {
                    if (count >= comments.length)
                        def.resolve();
                } else {
                    PostService.post({
                        url: 'sitediary/comment',
                        method: 'POST',
                        data: {
                            site_diary_id: comment.site_diary_id,
                            comment: comment.comment
                        }
                    }, function(result) {
                        if (count >= comments.length)
                            def.resolve();
                    }, function(error) {
                        if (count >= comments.length)
                            def.resolve();
                    })
                }
            });
            return def.promise;
        };

        var updateSd = updateDiary(),
            uploadAtt = uploadAttachments(),
            updateAtt = updateAttachments(),
            deleteAtt = deleteAttachments(),
            addComm = addComments();

        // run all operations then go back to the page where we come from - there project will be updated
        Promise.all([updateSd, uploadAtt, updateAtt, deleteAtt, addComm]).then(function(res) {
            console.log("ProjectDiaryCtrl - saveEdit() - then success promise all");
            syncPopup.close();
            //restore initial format for attachments and comments field
            $rootScope.currentSD.attachments = attachments.pictures || [];
            $rootScope.currentSD.comments = comments;
            vm.go('project');
        }, function(err) {
            console.log("ProjectDiaryCtrl - saveEdit() - then error promise all");
            SettingService.close_all_popups();
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
            template: loadingTemplate,
            content: "",
            buttons: []
        });

        PostService.post({
            url: 'sitediary',
            method: 'PUT',
            data: create
        }, function(result) {}, function(error) {
            SettingService.close_all_popups(); 
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        }, syncPopup);
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
            $rootScope.go('app.' + predicate, {
                id: vm.projectId
            });
        } else {
            $rootScope.go('app.' + predicate, {
                id: id
            });
        }
    }
}
