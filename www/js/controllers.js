angular.module('starter.controllers', ['services'])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $state, $http, userService, $ionicPopup) {
        userService.reconnect();
        $scope.userService = userService;

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };

        $scope.doLogin = function () {
            $scope.userService.login().then(function () {
                $scope.closeLogin();
                $state.go('app.current');
            }, function (msg) {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: msg
                });
            });
        };

        $scope.logout = function () {
            $scope.userService.logOut().then(function () {
                $state.go('app.current');
            }, function (msg) {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: msg
                });
            });
        };
    })

    .controller('SearchCtrl', function ($scope, $state, userService, $ionicPopup) {
        if (!userService.isLogged()) {
            $state.go('app.current');
        }
        $scope.search = {
            'content': ''
        };
        $scope.doSearch = function () {
            if ($scope.search.content) {
                $state.go('app.searchResult', {'searchValue' : $scope.search.content });
            } else {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: "Oui mais tu cherches quoi exactement ?"
                });
            }
        }
    })
    .controller('SearchResultCtrl', function($scope, $state, $stateParams, $http, socket, userService, $timeout, $ionicScrollDelegate){
        if (!userService.isLogged()) {
            $state.go('app.current');
        }
        $scope.resultList = [];
        $scope.loading = true;
        $scope.videoAdded = false;
        $scope.searchValue = $stateParams.searchValue;
        $http.get('http://vidlis.fr/searchRemote/' + $stateParams.searchValue).then(function(resp) {
            $scope.loading = false;
            $scope.resultList = resp.data.resultsSearch.items;
        }, function(err) {
            console.error('ERR', err);
        });
        $scope.launch = function (videoId) {
            var item = {
                videoId: videoId,
                username: userService.username
            };
            socket.emit("launchOnScreen", item);
            $scope.videoAdded = true;
            $ionicScrollDelegate.scrollTop();
            $timeout(function(){
                $scope.videoAdded = false;
                $state.go('app.current');
            }, 2000);

        };
    })
    .controller('CurrentCtrl', function ($scope, $http, socket, userService, VideoInformationService, videoSuggestService, $timeout, $ionicScrollDelegate) {
        $scope.videoInformation = VideoInformationService;
        $scope.videoSuggest = videoSuggestService;
        $scope.videoAdded = false;

        if(!userService.isLogged()) {
            return;
        }

        socket.emit('getVideoLaunchByUserName', userService.username);

        socket.on('videoLaunchByUserName', function(user) {
            if (user.videoId != '') {
                $scope.videoInformation.getInformation(user.videoId);
                $scope.videoInformation.setStatus(user.status);
                $scope.videoSuggest.getSuggests(user.videoId);
                userService.updateNextPreview();
            }
        });
        socket.on('getLaunched', function(user) {
            if (user.name == userService.username) {
                $scope.videoInformation.getInformation(user.videoId);
                $scope.videoInformation.setStatus(user.status);
                $scope.videoSuggest.getSuggests(user.videoId);
                userService.updateNextPreview();
            }
        });
        socket.on('userStatusChange', function(user) {
            if (user.name == userService.username) {
                $scope.videoInformation.setStatus(user.status);
                userService.updateNextPreview();
            }
        });
        socket.on('userUpdated', function(user) {
            if (user.name == userService.username) {
                userService.playlist = user.playlist;
                userService.currentPlayedIndex = new Intl.NumberFormat().format(user.currentPlayedIndex);
                userService.updateNextPreview();
            }
        });
        $scope.doRefresh = function () {
            socket.emit('getVideoLaunchByUserName', userService.username);
            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.updateStatus = function(newStatus) {
            socket.emit('updateUserStatusByRemote', {username: userService.username, status: newStatus});
        };
        $scope.previewNext = function(status) {
            socket.emit('changeVideoByRemote', {username: userService.username, status: status});
        };
        $scope.launch = function (videoId) {
            var item = {
                videoId: videoId,
                username: userService.username
            };
            socket.emit("launchOnScreen", item);
            $scope.videoAdded = true;
            $ionicScrollDelegate.scrollTop();
            $timeout(function(){ $scope.videoAdded = false; }, 2000);
        };
    });
