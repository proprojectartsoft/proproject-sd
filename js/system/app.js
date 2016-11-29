var $APP = $APP || {};
$APP.server = 'http://app.preprod.proproject.io/'
$APP.name = 'ppsd'

angular.module($APP.name, [
    'ionic',
    'angularMoment',
    'ion-datetime-picker',
]);

angular.module($APP.name).run(apprun);

function apprun($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.StatusBar) {
            StatusBar.styleDefault();
            StatusBar.overlaysWebView(false);
        }
    });
}
