angular.module($APP.name).factory('AuthService', [
    '$http',
    function($http) {
        var reload = function() {

        }
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
            forgotpassword_submit: function(email, password) {
                return $http.put($APP.server + '/pub/forgetpassword', '', {
                    params: {
                        'email': email,
                        'password': password
                    }
                }).then(function(payload) {
                    return payload.data;
                });
            },
            forgotpassword: function(email, thisBoolean) {
                var url = $APP.server + '/pub/forgetpassword?email=' + email + '&ds=' + thisBoolean;
                return $http.post(url).then(function(payload) {
                    return payload.data;
                });
            },
            login: function(user) {
                return $http({
                        method: 'POST',
                        url: $APP.server + '/pub/login',
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
                        localStorage.setObject('isLoggedIn', true);
                    })
                    .error(function errorCallback(response, status) {});
            },
            logout: function() {
                return $http.post($APP.server + '/pub/logout', {
                    withCredentials: true
                }).then(function(result) {
                    localStorage.removeItem('isLoggedIn');
                    return result;
                });
            }

        };
    }
]);
