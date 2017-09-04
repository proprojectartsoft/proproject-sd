angular.module($APP.name).factory('SyncService', [
    '$q',
    '$http',
    '$timeout',
    '$indexedDB',
    '$ionicPopup',
    '$state',
    '$filter',
    'ProjectService',
    'SiteDiaryService',
    'AttachmentsService',
    'SettingService',
    'AuthService',
    'SharedService',
    'filterFilter',
    function($q, $http, $timeout, $indexedDB, $ionicPopup, $state, $filter, ProjectService, SiteDiaryService, AttachmentsService, SettingService, AuthService, SharedService, filterFilter) {

        var getme = function() {
            return $http.get($APP.server + '/api/me')
                .success(function(user) {
                    return user;
                })
                .error(function(data, status) {
                    return status;
                })
        }
        var login = function() {
            var prm = $q.defer();
            if (localStorage.getObject('isLoggedIn')) {
                prm.resolve("logged");
            } else {
                var user = {};
                user.username = localStorage.getObject('dsremember').username;
                user.password = localStorage.getObject('dsremember').password;
                user.remember = localStorage.getObject('dsremember').remember;
                user.id = localStorage.getObject('dsremember').id;
                AuthService.login(user).success(function() {
                    prm.resolve("logged");
                }).error(function() {
                    prm.resolve("error");
                })
            }
            return prm.promise;
        }
        return {
            sync: function() {
                var deferred = $q.defer();
                $timeout(function() {
                    if (navigator.onLine) {
                        login().then(function(res) {
                            if (res == "logged") {
                                getme()
                                    .success(function(data) {
                                        function setCompanySettings() {
                                            SiteDiaryService.get_company_settings().success(function(sett) {
                                                $indexedDB.openStore('settings', function(store) {
                                                    //store all information about company settings
                                                    angular.forEach(sett, function(res) {
                                                        store.insert({
                                                            name: res.name,
                                                            value: res.value
                                                        });
                                                    })
                                                });
                                            })
                                        }

                                        function setCompanyLists() {
                                            var lists = [];
                                            var absenceReq = SiteDiaryService.absence_list().success(function(result) {
                                                angular.forEach(result, function(value) {
                                                    value.name = value.reason;
                                                })
                                                lists.push({
                                                    name: 'absence',
                                                    value: result
                                                });
                                            }).error(function(err) {
                                                lists.push({
                                                    name: 'absence',
                                                    value: []
                                                });
                                            })
                                            var resourceReq = SiteDiaryService.get_resources().success(function(result) {
                                                lists.push({
                                                    name: 'resources',
                                                    value: result
                                                });
                                            }).error(function(err) {
                                                lists.push({
                                                    name: 'resources',
                                                    value: []
                                                });
                                            })
                                            var unitReq = SiteDiaryService.get_units().success(function(result) {
                                                lists.push({
                                                    name: 'units',
                                                    value: result
                                                });
                                            }).error(function(err) {
                                                lists.push({
                                                    name: 'units',
                                                    value: []
                                                });
                                            })
                                            var staffReq = SiteDiaryService.get_staff().success(function(result) {
                                                lists.push({
                                                    name: 'staff',
                                                    value: result
                                                });
                                            }).error(function(err) {
                                                lists.push({
                                                    name: 'staff',
                                                    value: []
                                                });
                                            })
                                            Promise.all([absenceReq, resourceReq, unitReq, staffReq]).then(function() {
                                                $indexedDB.openStore('settings', function(store) {
                                                    angular.forEach(lists, function(list) {
                                                        store.insert(list);
                                                    })
                                                });
                                            })
                                        }

                                        function saveChanges(project) {
                                            $indexedDB.openStore('projects', function(store) {
                                                store.upsert(project).then(
                                                    function(e) {},
                                                    function(e) {
                                                        var offlinePopup = $ionicPopup.alert({
                                                            title: "Unexpected error",
                                                            template: "<center>An unexpected error occurred.</center>",
                                                            content: "",
                                                            buttons: [{
                                                                text: 'Ok',
                                                                type: 'button-positive',
                                                                onTap: function(e) {
                                                                    offlinePopup.close();
                                                                }
                                                            }]
                                                        });
                                                    })
                                            })
                                        }

                                        function storeDiariesDetails() {
                                            var def = $q.defer();
                                            $indexedDB.openStore('projects', function(store) {
                                                //get all stored projects
                                                store.getAll().then(function(projects) {
                                                    angular.forEach(projects, function(project) {
                                                        if (project.value.diaries.length) {
                                                            var diaries = project.value.diaries;
                                                            angular.forEach(diaries, function(diary) {
                                                                //store details for SDs
                                                                SiteDiaryService.list_diary(diary.id).then(function(data) {
                                                                    diary.data = data;
                                                                    //store comments for SDs
                                                                    var listComm = SiteDiaryService.list_comments(diary.id).then(function(result) {
                                                                        if (diary.data) {
                                                                            diary.data.comments = result;
                                                                        }
                                                                    })
                                                                    //store attachments for SDs
                                                                    var getAtt = AttachmentsService.get_attachments(diary.id).then(function(result) {
                                                                        diary.data.attachments = {
                                                                            pictures: result
                                                                        };
                                                                    });
                                                                    Promise.all([listComm, getAtt]).then(function(res) {
                                                                        if (diaries[diaries.length - 1] === diary) {
                                                                            $timeout(function() {
                                                                                //sttore data for current diary
                                                                                saveChanges(project);
                                                                                //last project and last diary
                                                                                if ((projects[projects.length - 1] === project)) {
                                                                                    $timeout(function() {
                                                                                        def.resolve();
                                                                                    }, 500);
                                                                                }
                                                                            }, 500);
                                                                        }
                                                                    })
                                                                });
                                                            });
                                                        } else {
                                                            //no diaries and last project
                                                            if ((projects[projects.length - 1] === project)) {
                                                                $timeout(function() {
                                                                    def.resolve()
                                                                }, 5000);
                                                            }
                                                        }
                                                    })
                                                })
                                            })
                                            return def.promise;
                                        }

                                        function storeDiaries() {
                                            var def = $q.defer();
                                            $indexedDB.openStore('projects', function(store) {
                                                //get all stored projects
                                                store.getAll().then(function(projects) {
                                                    angular.forEach(projects, function(project) {
                                                        //get a list of all diaries for project having the given id
                                                        SiteDiaryService.list_diaries(project.id).then(function(diaries) {
                                                            //store diaries for project
                                                            project.value.diaries = diaries;
                                                            saveChanges(project);
                                                            $timeout(function() {
                                                                if (projects[projects.length - 1] == project) {
                                                                    def.resolve();
                                                                }
                                                            }, 100);
                                                        });
                                                    })
                                                })
                                            });
                                            return def.promise;
                                        }

                                        function storeProjects() {
                                            var def = $q.defer();
                                            ProjectService.projects().then(function(projects) {
                                                //there are no projects to store
                                                if (!projects.length) def.resolve([]);
                                                angular.forEach(projects, function(value) {
                                                    //store every project in indexedDB
                                                    $indexedDB.openStore('projects', function(store) {
                                                        proj = {
                                                            "id": value.id,
                                                            "value": value,
                                                        }
                                                        store.insert(proj).then(function(e) {
                                                            if (projects[projects.length - 1] === value) {
                                                                def.resolve(projects);
                                                            };
                                                        });
                                                    });
                                                });
                                            });
                                            return def.promise;
                                        }

                                        function buildData() {
                                            var def = $q.defer();
                                            setCompanySettings();
                                            setCompanyLists();
                                            //store projects locally
                                            storeProjects().then(function(res) {
                                                //no projects stored
                                                if (res == []) {
                                                    def.resolve();
                                                }
                                                //store diaries for stored projects
                                                storeDiaries().then(function(d) {
                                                    //store diaries details
                                                    storeDiariesDetails().then(function() {
                                                        def.resolve();
                                                    })
                                                })
                                            })
                                            return def.promise;
                                        }

                                        var tempSD = {};
                                        $indexedDB.openStore('projects', function(store) {
                                            if (!sessionStorage.getObject('projectId'))
                                                store.clear();
                                            else {
                                                var proj = store.find(sessionStorage.getObject('projectId')).then(function(e) {
                                                    if (e.temp) {
                                                        tempSD = e.temp;
                                                    }
                                                    store.clear();
                                                })
                                            }
                                        }).then(function(e) {
                                            buildData().then(function() {
                                                $indexedDB.openStore('projects', function(store) {
                                                    //get all stored projects
                                                    store.getAll().then(function(projects) {
                                                        if (!projects.length) deferred.resolve('sync_done');
                                                        angular.forEach(projects, function(project) {
                                                            if (tempSD != {} && tempSD.project_id == project.id) {
                                                                //store the temp SD on indexedDB
                                                                project.temp = tempSD;
                                                                saveChanges(project);
                                                            }
                                                            $timeout(function() {
                                                                deferred.resolve('sync_done');
                                                            }, 500);
                                                        })
                                                    })
                                                })
                                            });
                                        });
                                    })
                                    .error(function(data, status) {
                                        deferred.resolve();
                                        if (!navigator.onLine) {
                                            var loggedIn = localStorage.getObject('dsremember');
                                            console.log('Offline');
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
                                            if (loggedIn) {
                                                $state.go('app.home');
                                            }
                                        }
                                    });
                            } else {
                                deferred.resolve();
                                var offlinePopup = $ionicPopup.alert({
                                    title: "Error",
                                    template: "An unexpected error occured during authentication and sync could not be done. Please try again.",
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
                        })
                    } else {
                        var loggedIn = localStorage.getObject('dsremember');
                        console.log('Offline');
                        deferred.resolve();
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
                        if (loggedIn) {
                            $state.go('app.home');
                        }
                    }
                })

                if (sessionStorage.getObject('sd.diary.shares')) {
                    var shares = sessionStorage.getObject('sd.diary.shares');
                    for (var a = 0; a < shares.length; a++) {
                        SharedService.share_diary(shares[a].id, shares[a].res).then(function(result) {});
                    }
                }
                return deferred.promise;
            },
            addDiariesToSync: function() {
                var prm = $q.defer();
                $timeout(function() {
                    if (navigator.onLine && localStorage.getObject('diariesToSync')) {
                        login().then(function(res) {
                            if (res == "logged") {
                                var diariesToAdd = [];
                                $indexedDB.openStore('projects', function(store) {
                                    store.getAll().then(function(result) {
                                        angular.forEach(result, function(project) {
                                            angular.forEach($filter('filter')(project.value.diaries, function(d) {
                                                return /^off.*/g.test(d.id);
                                            }), function(sd) {
                                                diariesToAdd.push(sd);
                                            })
                                        })
                                        localStorage.removeItem('diariesToSync');
                                        if (diariesToAdd && !diariesToAdd.length) {
                                            prm.resolve();
                                        }
                                        angular.forEach(diariesToAdd, function(diaryToAdd) {
                                            diaryToAdd.id = 0;
                                            SiteDiaryService.add_diary(diaryToAdd.data)
                                                .success(function(result) {
                                                    var attachments = diaryToAdd.attachments;
                                                    var attToAdd = [];
                                                    angular.forEach(attachments.pictures, function(value) {
                                                        if (!value.path) {
                                                            value.site_diary_id = result.id;
                                                            attToAdd.push(value);
                                                        }
                                                    });
                                                    if (attToAdd) {
                                                        AttachmentsService.upload_attachments(attToAdd).then(function(result) {});
                                                    }
                                                    var comments = diaryToAdd.data.comments;
                                                    angular.forEach(comments, function(value) {
                                                        var request = {
                                                            site_diary_id: result.id,
                                                            comment: value.comment,
                                                        };
                                                        SiteDiaryService.add_comments(request).then(function(result) {});
                                                    })
                                                    if (diariesToAdd[diariesToAdd.length - 1] == diaryToAdd) {
                                                        prm.resolve();
                                                    }
                                                }).error(function(err) {
                                                    if (diariesToAdd[diariesToAdd.length - 1] == diaryToAdd) {
                                                        prm.resolve();
                                                    }
                                                })
                                        })
                                    });
                                });
                            } else {
                                prm.resolve();
                                var offlinePopup = $ionicPopup.alert({
                                    title: "Error",
                                    template: "An unexpected error occured during authentication and sync could not be done. Please try again.",
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
                        })
                    } else {
                        prm.resolve();
                    }
                })
                return prm.promise;
            }
        }
    }
]);
