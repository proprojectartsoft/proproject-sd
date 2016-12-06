angular.module($APP.name).factory('AttachmentsService', [
'$http',
function($http) {
    return {
        get_attachment: function(id) {
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
                url: $APP.server + '/api/sdattachments/uploadfiles',
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
                url: $APP.server + '/api/sdattachments',
                data: dataIn
            }).then(
                function(payload) {
                    return payload.data;
                }
            );
        },
};
}]);
