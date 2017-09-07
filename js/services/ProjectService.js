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

            add_projects: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/project/',
                    data: dataIn
                }).success(function(response) {}).error(function(response) {});
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
            },

            my_account: function(id) {
                return $http.get($APP.server + '/api/user/profile', {
                    params: {
                        id: id
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            }

        };
    }
]);
