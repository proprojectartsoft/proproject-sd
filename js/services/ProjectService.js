sdApp.factory('ProjectService', [
    '$http',
    function($http) {
        return {

            projects: function() {
                return $http.get($APP.server + '/api/project/sitediary', {}).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            sync_projects: function() {
                return $http.get($APP.server + '/api/sync/sd', {}).success(
                    function(payload) {
                        return payload.data;
                    }
                ).error(function(err) {
                    return err;
                });
            },
            
            update_account: function(dataIn) {
                return $http({
                    method: 'PUT',
                    url: $APP.server + '/api/user',
                    data: dataIn
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            }
        };
    }
]);
