angular.module($APP.name).factory('SiteDiaryService', [
    '$http',
    function($http) {
        return {

            list_diary: function(id) {
                return $http.get($APP.server + '/api/sitediary', {
                    params: {
                        id: id
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            list_diaries: function(projectId) {
                return $http.get($APP.server + '/api/sitediary', {
                    params: {
                        projectId: projectId
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            list_comments: function(id) {
                return $http.get($APP.server + '/api/sitediary/comment', {
                    params: {
                        siteDiaryId: id
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            add_comments: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/sitediary/comment',
                    data: dataIn
                }).success(function(response) {}).error(function(response) {});
            },

            get_resources: function() {
                return $http.get($APP.server + '/api/resource', {}).success(function(payload) {
                    return payload.data;
                }).error(function(err) {})
            },

            absence_list: function() {
                return $http.get($APP.server + '/api/absenteeismreasons/list', {}).success(
                    function(payload) {
                        return payload.data;
                    }
                ).error(function(err) {})
            },

            get_units: function() {
                return $http.get($APP.server + '/api/unit', {}).success(
                    function(payload) {
                        return payload.data;
                    }
                ).error(function(err) {})
            },

            get_staff: function() {
                return $http.get($APP.server + '/api/staff', {}).success(
                    function(payload) {
                        return payload.data;
                    }
                ).error(function(err) {})
            },

            get_company_settings: function() {
                return $http.get($APP.server + '/api/companysettings', {}).success(
                    function(payload) {
                        return payload.data;
                    }
                ).error(function(err) {})
            },

            add_diary: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/sitediary',
                    data: dataIn
                }).success(function(response) {}).error(function(response) {});
            },

            update_diary: function(dataIn) {
                return $http({
                    method: 'PUT',
                    url: $APP.server + '/api/sitediary',
                    data: dataIn
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            delete_diary: function(id) {
                return $http({
                    method: 'DELETE',
                    url: $APP.server + '/api/sitediary',
                    params: {
                        id: id,
                    }
                }).success(
                    function(payload) {
                        return payload.data;
                    }
                ).error(function() {
                    return payload.data;
                })
            },

            revision: function(id, revision) {
                return $http.get($APP.server + '/api/sitediary/revision', {
                    params: {
                        id: id,
                        revision: revision
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
