var myApp = angular.module('myApp', ['ngRoute', 'uiGmapgoogle-maps', 'ngSanitize', 'ngStorage', 'ui.bootstrap', 'angularMoment'])
    .config(function($routeProvider, uiGmapGoogleMapApiProvider, $sceDelegateProvider, $compileProvider) {
        $routeProvider
            .when("/", {
                templateUrl : "/../../templates/main.html"
            });
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyAt9E98xTomnor-btg8s0qy6MZDu_Of4O0',
            v: '3.30',
            libraries: 'weather,geometry,visualization'
        });
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://www.zillow.com/webservice/**'
        ]);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    });