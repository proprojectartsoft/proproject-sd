angular.module($APP.name).factory('SyncService', [
    '$q',
    '$http',
    '$timeout',
    '$indexedDB',
    '$ionicPopup',
    '$state',
    'ProjectService',
    'SiteDiaryService',
    function($q, $http, $timeout, $indexedDB, $ionicPopup,$state, ProjectService, SiteDiaryService) {

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
            sync: function() {
                var deferred = $q.defer();
                var syncPopup = $ionicPopup.alert({
                    title: "Syncing",
                    template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                    content: "",
                    buttons: []
                });

                $timeout(function() {
                    if (navigator.onLine) {
                        getme()
                            .success(function(data) {
                                function buildData() {
                                    var def = $q.defer();
                                    ProjectService.projects().then(function(result) {
                                        console.log(result);
                                        //def.resolve(result);
                                        angular.forEach(result, function(value) {
                                            SiteDiaryService.list_diaries(value.id).then(function(diaries) {
                                                value.diaries = diaries;
                                                if ((result[result.length - 1] === value)) {
                                                    //def.resolve(result);
                                                }
                                                if (value.diaries.length) {
                                                    angular.forEach(diaries, function(diary) {
                                                        SiteDiaryService.list_diary(diary.id).then(function(data) {
                                                            diary.data = data;
                                                            console.log('Diary downloaded');
                                                            if ((diaries[diaries.length - 1] === diary) && (result[result.length - 1] === value)) {
                                                                def.resolve(result);
                                                                console.log("The final result: ", result)
                                                            }
                                                        });
                                                    });
                                                } else {

                                                }
                                            });
                                        });
                                    });
                                    return def.promise;
                                }

                                function addDiaries() {
                                    var newDef = $q.defer();
                                    buildData().then(function(projects) {


                                    })
                                }

                                $indexedDB.openStore('projects', function(store) {
                                    store.clear();
                                }).then(function(e) {
                                    console.log("inSync");
                                    buildData().then(function(projects) {
                                        angular.forEach(projects, function(project) {
                                            $indexedDB.openStore('projects', function(store) {
                                                console.log(project);
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
                                    });
                                });

                            })
                            .error(function(data, status) {
                                if (!navigator.online) {
                                    var loggedIn = localStorage.getObject('dsremember');
                                    console.log('Offline');
                                    var offlinePopup = $ionicPopup.alert({
                                        title: "Syncing",
                                        template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                                        content: "",
                                        buttons: []
                                    });
                                    $timeout(function(){
                                      offlinePopup.close();
                                    },3000);
                                    if (loggedIn) {
                                        $state.go('app.home');
                                    }

                                }
                            });
                    } else {
                      var loggedIn = localStorage.getObject('dsremember');
                      console.log('Offline');
                      syncPopup.close();
                      var offlinePopup = $ionicPopup.alert({
                          title: "Syncing",
                          template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                          content: "",
                          buttons: []
                      });
                      $timeout(function(){
                        offlinePopup.close();
                      },3000);
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
