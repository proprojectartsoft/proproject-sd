sdApp.factory('AttachmentsService', [
    '$http',
    function($http) {
        return {
            get_attachments: function(id) {
                return $http.get($APP.server + '/api/sdattachment', {
                    params: {
                        id: id
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },
            upload_attachments: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/sdattachment/uploadfiles',
                    data: dataIn
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },
            delete_attachments: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/sdattachment',
                    data: dataIn
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },
            update_attachments: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/sdattachment/update',
                    data: dataIn
                }).then(
                    function(payload) {
                        return payload.data;
                    }
                );
            },
        };
    }
]);
