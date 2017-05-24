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
    function($q, $http, $timeout, $indexedDB, $ionicPopup, $state, $filter, ProjectService, SiteDiaryService, AttachmentsService, SettingService) {

        var getme = function() {
            return $http.get($APP.server + '/api/me')
                .success(function(user) {
                    return user.data;
                })
                .error(function(data, status) {
                    return status;
                })
        }
        return {
            sync: function(title) {
                var deferred = $q.defer();

                $timeout(function() {
                    if (navigator.onLine) {
                        getme()
                            .success(function(data) {
                                var syncPopup = $ionicPopup.show({
                                    title: title,
                                    template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                                    content: "",
                                    buttons: []
                                });

                                function addDiaries() {
                                    var prm = $q.defer();
                                    var diaryToAdd = localStorage.getObject('diaryToSync');
                                    if (diaryToAdd && diaryToAdd.data) {
                                        SiteDiaryService.add_diary(diaryToAdd.data)
                                            .success(function(result) {
                                                var attachments = diaryToAdd.attachments;
                                                var attToAdd = [];
                                                angular.forEach(attachments.pictures, function(value) {
                                                    if (!value.path) {
                                                        value.site_diary_id = result.data.id;
                                                        attToAdd.push(value);
                                                    }
                                                });
                                                if (attToAdd) {
                                                    AttachmentsService.upload_attachments(attToAdd).then(function(result) {});
                                                }
                                                var comments = diaryToAdd.comments;
                                                angular.forEach(comments, function(value) {
                                                    var request = {
                                                        site_diary_id: result.data.id,
                                                        comment: value,
                                                    };
                                                    SiteDiaryService.add_comments(request).then(function(result) {});
                                                })
                                                diaryToAdd = {};
                                                localStorage.setObject('diaryToSync', diaryToAdd);
                                                prm.resolve();
                                            }).error(function(err) {
                                                prm.resolve();
                                            })
                                    } else {
                                        prm.resolve();
                                    }
                                    return prm.promise;
                                }

                                function setCurrencySymbol() {
                                    SiteDiaryService.get_company_settings().then(function(curr) {
                                        localStorage.setObject('currency',
                                            SettingService.get_currency_symbol(
                                                $filter('filter')(curr, {
                                                    name: "currency"
                                                })[0]
                                            )
                                        )
                                    })
                                }

                                function buildData() {
                                    var def = $q.defer();
                                    addDiaries().then(function() {
                                        setCurrencySymbol();
                                        ProjectService.projects().then(function(result) {
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
                                                            });
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    })
                                    return def.promise;
                                }

                                $indexedDB.openStore('projects', function(store) {
                                    store.clear();
                                }).then(function(e) {
                                    buildData().then(function(projects) {
                                        var diaryToAdd = localStorage.getObject('diaryToSync');
                                        if (diaryToAdd && diaryToAdd.data) {
                                            SiteDiaryService.add_diary(diaryToAdd.data)
                                                .success(function(result) {
                                                    var attachments = diaryToAdd.attachments;
                                                    var attToAdd = [];
                                                    angular.forEach(attachments.pictures, function(value) {
                                                        if (!value.path) {
                                                            value.site_diary_id = result.data.id;
                                                            attToAdd.push(value);
                                                        }
                                                    });
                                                    if (attToAdd) {
                                                        AttachmentsService.upload_attachments(attToAdd).then(function(result) {});
                                                    }
                                                    var comments = diaryToAdd.comments;
                                                    angular.forEach(comments, function(value) {
                                                        var request = {
                                                            site_diary_id: result.data.id,
                                                            comment: value,
                                                        };
                                                        SiteDiaryService.add_comments(request).then(function(result) {});
                                                    })
                                                    diaryToAdd = {};
                                                    localStorage.setObject('diaryToSync', diaryToAdd);
                                                    angular.forEach(projects, function(project) {
                                                        $indexedDB.openStore('projects', function(store) {
                                                            store.insert({
                                                                "id": project.id,
                                                                "value": project,
                                                            }).then(function(e) {
                                                                if (projects[projects.length - 1] === project) {
                                                                    syncPopup.close();
                                                                    deferred.resolve('sync_done');
                                                                };
                                                            });
                                                        });
                                                    })
                                                }).error(function(err) {
                                                    syncPopup.close();
                                                    deferred.resolve('sync_done');
                                                })
                                        } else {
                                            angular.forEach(projects, function(project) {
                                                $indexedDB.openStore('projects', function(store) {
                                                    store.insert({
                                                        "id": project.id,
                                                        "value": project,
                                                    }).then(function(e) {
                                                        if (projects[projects.length - 1] === project) {
                                                            syncPopup.close();
                                                            deferred.resolve('sync_done');
                                                        };
                                                    });
                                                });
                                            })
                                        }
                                    });
                                });
                            })
                            .error(function(data, status) {
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
                })
                return deferred.promise;
            }
        }
    }
]);
