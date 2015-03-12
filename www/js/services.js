var nodeAppUrl = 'http://localhost:8080/';

angular.module('services', [])
    .factory('$localstorage', ['$window', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])
    .factory('socket', function socket($rootScope) {
        var socket = io.connect(nodeAppUrl);
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    }).factory('UserService', function($http, $q, $localstorage) {
        var factory = {
            username: '',
            password: '',
            isLog: false,
            login: function() {
                var deferred = $q.defer();
                $http({
                    method: "post",
                    url: "http://vidlis.fr/loginRemote",
                    data: "username=" + factory.username + "&password=" + factory.password,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data) {
                    if (data.status) {
                        $localstorage.set('username', factory.username);
                        $localstorage.set('password', factory.password);
                        factory.isLog = true;
                        deferred.resolve(factory.isLog);
                    } else {
                        deferred.reject(data.message);
                    }
                }).error(function() {
                    deferred.reject('Une erreur est survenue');
                });
                return deferred.promise;
            },
            isLogged: function() {
             return factory.isLog;
            },
            reconnect: function() {
                if ($localstorage.get('username', false)) {
                    factory.username = $localstorage.get('username');
                    factory.isLog = true;
                    return true;
                } else {
                    return false;
                }
            },
            logOut: function() {
                factory.isLog = false;
                factory.username = '';
                return true;
            }
        };
        return factory;
    })