var nodeAppUrl = 'http://37.59.63.129:8080/';

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
    }).factory('VideoInformationService', function($http, $q) {
        var VideoInformationService = {
            videoId: '',
            title: '',
            channel: '',
            img: '',
            like: 0,
            dislike: 0,
            percentLike: 0,
            loaded: false,
            loading: false,
            status: 0,
            getInformation: function(videoId, status) {
                VideoInformationService.status = status;
                VideoInformationService.videoId = videoId;
                VideoInformationService.loaded = false;
                VideoInformationService.loading = true;
                var deferred = $q.defer();
                $http.get("http://vidlis.fr/videoInformationRemote/" + VideoInformationService.videoId)
                    .success(function(data) {
                        var item = data.video.items[0];
                        VideoInformationService.loaded = true;
                        VideoInformationService.loading = false;
                        VideoInformationService.title = item.snippet.title;
                        VideoInformationService.img = item.snippet.thumbnails.medium;
                        VideoInformationService.channel = item.snippet.channelTitle;
                        VideoInformationService.like  = new Intl.NumberFormat().format(item.statistics.likeCount);
                        VideoInformationService.dislike  = new Intl.NumberFormat().format(item.statistics.dislikeCount);
                        total = item.statistics.likeCount * 1 + item.statistics.dislikeCount * 1;
                        VideoInformationService.percentLike = item.statistics.likeCount / total * 100;
                        deferred.resolve();
                    }).error(function() {
                        VideoInformationService.loading = false;
                        VideoInformationService.loaded = true;
                        deferred.reject('Une erreur est survenue');
                });
                return deferred.promise;
            },
            setStatus: function(status) {
                VideoInformationService.status = status;
            }
        }
        return VideoInformationService;
    })