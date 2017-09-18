"use strict";
var $APP = $APP || {};
// $APP.server = 'http://app.preprod.proproject.io/';
$APP.server = 'http://app.proproject.io/';
// $APP.server = 'http://artvm23.vmnet.ro/';
$APP.name = 'ppsd';

var sdApp = angular.module($APP.name, [
	'ionic',
	'angularMoment',
	'ion-datetime-picker',
	'ngCordova'
]).config(function ($ionicConfigProvider) {
	$ionicConfigProvider.views.swipeBackEnabled(false);
}).run(apprun);

function apprun($ionicPlatform) {
	$ionicPlatform.ready(function () {
		if (window.StatusBar) {
			StatusBar.styleDefault();
			StatusBar.overlaysWebView(false);
		}
	});
}
