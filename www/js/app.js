// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'leaflet-directive', 'ngCordova', 'igTruncate', 'ionic-ajax-interceptor', 'ngAria', 'ngAnimate', 'ngMaterial'])

.run(function($ionicPlatform, AjaxInterceptor, $ionicPopup, $rootScope) {
    AjaxInterceptor.run();
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        $rootScope.$broadcast("cordovaReady");
        //$rootScope.cordova = cordova.file.dataDirectory;
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });


})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $logProvider, AjaxInterceptorProvider, $mdGestureProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.useXDomain = true;
    $logProvider.debugEnabled(false);
    $mdGestureProvider.skipClickHijack();
    AjaxInterceptorProvider.config({
        title: "Bummer",
        defaultMessage: "I crashed :("
    });
    $stateProvider

        .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.projects', {
        url: '/projects?typeLayer',
        views: {
            'menuContent': {
                templateUrl: 'templates/projects.html',
                controller: 'ProjectsCtrl'
            }
        }
    })

    .state('app.project', {
        url: '/project/:identifier?{online:bool}',
        views: {
            'menuContent': {
                templateUrl: 'templates/project.html',
                controller: 'ProjectCtrl'
            }
        }
    })

    .state('app.newProject', {
        url: '/newProject',
        views: {
            'menuContent': {
                templateUrl: 'templates/newProject.html',
                controller: 'NewProjectCtrl'
            }
        }
    })


    .state('app.localProjects', {
        url: '/localProjects',
        views: {
            'menuContent': {
                templateUrl: 'templates/localProjects.html',
                controller: 'LocalProjectsCtrl'
            }
        }
    })

    .state('app.search', {
        url: '/search',
        views: {
            'menuContent': {
                templateUrl: 'templates/search.html'
            }
        }
    })

    .state('app.browse', {
        url: '/browse',
        views: {
            'menuContent': {
                templateUrl: 'templates/browse.html'
            }
        }
    })

    .state('app.project.polygonDetail', {
        url: '/polygonDetail',
        views: {
            'menuContent': {
                templateUrl: 'templates/polygonDetail.html',
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/projects?typeLayer=exposure');
});
