sdApp.factory('AuthService', [
    '$http',
    function($http) {
        return {
            init: function() {
                return $http.get($APP.server + '/api/me', {
                    withCredentials: true
                }).then(function(user) {
                    return user;
                }, function() {
                    return 'error';
                });
            },
            forgotpassword: function(email, thisBoolean) {
                var url = $APP.server + '/pub/forgetpassword?email=' + email + '&ds=' + thisBoolean;
                return $http.post(url).then(function(payload) {
                    return payload.data;
                });
            },
            // login operation this must stay here
            login: function(user, success, error) {
                return $http({
                    method: 'POST',
                    url: $APP.server + 'pub/login',
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json;odata=verbose'
                    },
                    transformRequest: function(obj) {
                        return 'login.user.name=' + user.username + '&login.user.password=' + user.password + '&user=true';
                    },
                    data: user
                }).success(function(data) {
                    sessionStorage.setObject('isLoggedIn', true);
                    success(data);
                }).error(function errorCallback(response, status) {
                    error(status);
                });
            },
            logout: function() {
                return $http.post($APP.server + '/pub/logout', {
                    withCredentials: true
                }).then(function(result) {
                    sessionStorage.removeItem('isLoggedIn');
                    return result;
                });
            }

        };
    }
]);
