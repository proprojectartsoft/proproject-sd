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
                    return user.data;
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
                                                localStorage.setObject('companySettings', sett);
                                            })
                                        }

                                        function setCompanyLists() {
                                            var lists = {};
                                            var ready1 = false,
                                                ready2 = false,
                                                ready3 = false,
                                                ready4 = false;
                                            var prm = $q.defer();
                                            SiteDiaryService.absence_list().success(function(result) {
                                                angular.forEach(result, function(value) {
                                                    value.name = value.reason;
                                                })
                                                lists.absence_list = result;
                                                ready1 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            }).error(function(err) {
                                                lists.absence_list = [];
                                                ready1 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            })
                                            SiteDiaryService.get_resources().success(function(result) {
                                                lists.resources = result;
                                                ready2 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            }).error(function(err) {
                                                lists.resources = [];
                                                ready2 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            })
                                            SiteDiaryService.get_units().success(function(result) {
                                                lists.units = result;
                                                ready3 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            }).error(function(err) {
                                                lists.units = [];
                                                ready3 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            })
                                            SiteDiaryService.get_staff().success(function(result) {
                                                lists.staff = result;
                                                ready4 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            }).error(function(err) {
                                                lists.staff = [];
                                                ready4 = true;
                                                ready1 && ready2 && ready3 && ready4 && prm.resolve(lists);
                                            })
                                            return prm.promise;
                                        }

                                        function buildData() {
                                            var def = $q.defer();
                                            setCompanySettings();
                                            setCompanyLists().then(function(result) {
                                                localStorage.setObject('companyLists', result);
                                            })
                                            ProjectService.projects().then(function(result) {
                                                if (!result.length) def.resolve([]);
                                                angular.forEach(result, function(value) {
                                                    SiteDiaryService.list_diaries(value.id).then(function(diaries) {
                                                        value.diaries = diaries;
                                                        if ((result[result.length - 1] === value)) {
                                                            $timeout(function() {
                                                                def.resolve(result)
                                                            }, 5000);
                                                        }
                                                        if (value.diaries.length) {
                                                            angular.forEach(diaries, function(diary) {
                                                                SiteDiaryService.list_diary(diary.id).then(function(data) {
                                                                    diary.data = data;
                                                                    SiteDiaryService.list_comments(diary.id).then(function(result) {
                                                                        if (diary.data) {
                                                                            diary.data.comments = result;
                                                                        }
                                                                    })
                                                                });
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                            return def.promise;
                                        }

                                        $indexedDB.openStore('projects', function(store) {
                                            store.clear();
                                        }).then(function(e) {
                                            buildData().then(function(projects) {
                                                if (!projects.length) deferred.resolve('sync_done');
                                                angular.forEach(projects, function(project) {
                                                    $indexedDB.openStore('projects', function(store) {
                                                        store.insert({
                                                            "id": project.id,
                                                            "value": project,
                                                        }).then(function(e) {
                                                            if (projects[projects.length - 1] === project) {
                                                                deferred.resolve('sync_done');
                                                            };
                                                        });
                                                    });
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

                if (localStorage.getObject('sd.diary.shares')) {
                    var shares = localStorage.getObject('sd.diary.shares');
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
                                            diariesToAdd = angular.extend(diariesToAdd, $filter('filter')(project.value.diaries, function(d) {
                                                return /^off.*/g.test(d.id);
                                            }))
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
