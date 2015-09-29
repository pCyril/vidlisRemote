// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.search', {
                url: "/search",
                views: {
                    'mainContent': {
                        templateUrl: "templates/search.html",
                        controller: "SearchCtrl"
                    }
                }
            })

            .state('app.searchResult', {
                url: "/search/:searchValue",
                views: {
                    'mainContent': {
                        templateUrl: "templates/searchResult.html",
                        controller: "SearchResultCtrl"
                    }
                }
            })

            .state('app.current', {
                url: "/current",
                views: {
                    'mainContent': {
                        templateUrl: "templates/current.html",
                        controller: "CurrentCtrl"
                    }
                }
            })

            .state('app.playlists', {
                url: "/playlists",
                views: {
                    'mainContent': {
                        templateUrl: "templates/playlists.html",
                        controller: "PlaylistsCtrl"
                    }
                }
            })

            .state('app.playlistDetail', {
                url: "/playlist/:idPlaylist",
                views: {
                    'mainContent': {
                        templateUrl: "templates/playlist.detail.html",
                        controller: "PlaylistDetailCtrl"
                    }
                }
            });
        $urlRouterProvider.otherwise('/app/current');
    });
