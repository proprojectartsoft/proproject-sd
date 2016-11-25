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
                return $http.get($APP.server + '/api/resource', {}).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            absence_list: function() {
                return $http.get($APP.server + '/api/absenteeismreasons/list', {}).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            get_units: function() {
                return $http.get($APP.server + '/api/unit', {}).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            get_staff: function() {
                return $http.get($APP.server + '/api/staff', {}).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },

            get_absenteeism: function() {
                return $http.get($APP.server + '/api/absenteeismreasons/list', {}).then(
                    function(payload) {
                        return payload.data;
                    }
                );
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
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
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
