angular.module($APP.name).factory('SyncService', [
    '$http',
    '$indexedDB',
    'ProjectService',
    'SiteDiaryService',
    function($http, $indexedDB, ProjectService, SiteDiaryService) {
        return {
            sync: function() {
                $indexedDB.openStore('projects', function(store) {
                    store.clear();
                }).then(function(e) {
                    console.log("inSync");
                    ProjectService.projects().then(function(result) {
                        console.log(result);
                        angular.forEach(result, function(value) {
                            SiteDiaryService.list_diaries(value.id).then(function(diaries) {
                                value.diaries = diaries;
                                $indexedDB.openStore('projects', function(store) {
                                    console.log(value);
                                    store.insert({
                                        "id": value.id,
                                        "value": value
                                    }).then(function(e) {
                                        console.log('IT WORKS')
                                    });
                                });
                            })
                        })
                    })
                })
            }
        };
    }
]);
