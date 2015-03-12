angular.module('starter.controllers', ['services'])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $state, $http, UserService, $ionicPopup) {
        UserService.reconnect();
        $scope.userService = UserService;

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
            $scope.userService.login().then(function (user) {
                $scope.closeLogin();
                $state.go('app.current');
            }, function (msg) {
                $ionicPopup.alert({
                    title: 'Erreur',
                    template: msg
                });
            });
        };
    })

    .controller('SearchCtrl', function ($scope, $state, UserService, $ionicPopup) {
        if (!UserService.isLogged()) {
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
    .controller('SearchResultCtrl', function($scope, $stateParams, $http, socket, UserService){
        if (!UserService.isLogged()) {
            $state.go('app.current');
        }
        $scope.resultList = [];
        $scope.loading = true;
        $scope.searchValue = $stateParams.searchValue;
        $http.get('http://vidlis.fr/searchRemote/' + $stateParams.searchValue).then(function(resp) {
            $scope.loading = false;
            $scope.resultList = resp.data.resultsSearch.items;
        }, function(err) {
            console.error('ERR', err);
        });
        $scope.launch = function (videoId) {
            socket.emit("launchOnScreen", videoId)
        }
    })
    .controller('CurrentCtrl', function ($scope, $http, socket) {

    });
