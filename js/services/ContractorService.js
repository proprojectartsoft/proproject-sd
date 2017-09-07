sdApp.factory('ContractorService', [
'$http',
function($http) {
    return {
        list: function(id) {
            return $http.get($APP.server + '/api/contractor/list',{}).then(
                function(payload) {
                    return payload.data;
                }
            );
        },
        add_contractor: function(dataIn) {
            return $http({
                method: 'POST',
                url: $APP.server + '/api/contractor',
                data: dataIn
            }).then(
                function(payload) {
                    return payload.data;
                }
            );
        },
        update_contractor: function (dataIn) {
          return $http({
            method: 'PUT',
            url: $APP.server + '/api/contrator',
            data: dataIn
          }).then(
            function (payload) {
              return payload.data;
            }
          );
        },
};
}]);
