(function () {
	
	angular.module('nativeQDAApp', ['ngRoute', 'ngSanitize', 'ngTable', 'ui.bootstrap', 'ui.bootstrap.datepicker', 'rzModule', 'ngFileUpload', 'ngTagsInput', 'jp.ng-bs-animated-button']);

	config.$inject = ['$routeProvider', '$locationProvider'];
	function config ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/login', {
			templateUrl: '/components/auth/login/login.view.html',
			controller: 'loginCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/register', {
			templateUrl: '/components/auth/register/register.view.html',
			controller: 'registerCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/forgot-password', {
			templateUrl: '/components/auth/forgotPass/forgotPass.view.html',
			controller: 'forgotPassCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/', {
			templateUrl: '/components/home/home.view.html',
			controller: 'homeCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis/map', {
			templateUrl: '/components/analysis/map/map.view.html',
			controller: 'mapCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis/data', {
			templateUrl: '/components/analysis/data/data.view.html',
			controller: 'dataCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/analysis/visualisation', {
			templateUrl: '/components/analysis/visualisation/visualisation.view.html',
			controller: 'visualisationCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/survey', {
			templateUrl: '/components/survey/survey.view.html',
			controller: 'surveyCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/files', {
			templateUrl: '/components/files/files.view.html',
			controller: 'filesCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/settings', {
			templateUrl: '/components/settings/settings.view.html',
			controller: 'settingsCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/complete-survey', {
			templateUrl: '/components/survey/completeSurvey/completeSurvey.view.html',
			controller: 'CompleteSurveyCtrl',
			controllerAs: 'vm',
			loginRequired: false
		})
		.when('/heatmap-example', {
			templateUrl: '/components/heatmapExample/heatmapExample.view.html',
			controller: 'heatmapCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.when('/test-analysis', {
			templateUrl: '/components/testAnalysis/testAnalysis.view.html',
			controller: 'testAnalysisCtrl',
			controllerAs: 'vm',
			loginRequired: true
		})
		.otherwise({redirectTo: '/'});

	    // use the HTML5 History API
	    $locationProvider.html5Mode(true);
	}

	function run ($rootScope, $location, authentication) {
		$rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
			var postLogInRoute;
			if(nextRoute.loginRequired && !authentication.isLoggedIn()){
				postLogInRoute = $location.path();
				$location.path('/login').replace();
				$location.search('page', postLogInRoute);
			} else if (nextRoute.loginRequired && authentication.isLoggedIn()) {
				$location.path(postLogInRoute).replace();
				postLogInRoute = null;
			} 
		});
	}

	angular
	.module('nativeQDAApp')
	.config(['$routeProvider', '$locationProvider', config])
	.run(['$rootScope', '$location', 'authentication', run]);

})();