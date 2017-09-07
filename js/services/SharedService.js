sdApp.factory('SharedService', [
    '$http',
    function($http) {
        return {

            shared_diary: function(shared) {
                return $http.get($APP.server + '/api/sharesitediary',{
                        params: {
                            shared: shared
                        }
                    }).then(
                        function(payload) {
                            return payload.data;
                        }
                    );
            },

            share_diary: function(siteDiaryId, email) {
              var url = $APP.server + '/api/sharesitediary?siteDiaryId=' + siteDiaryId + '&email=' + email;
              return $http.post(url).then(function (payload) {
                  return payload.data;
              });
            },

            shared_comment: function(id) {
                return $http.get($APP.server + '/api/sharesdcomment',{
                        params: {
                            id: id
                        }
                    }).then(
                        function(payload) {
                            return payload.data;
                        }
                    );
            },

            share_comment: function(dataIn) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/sharesdcomment',
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
