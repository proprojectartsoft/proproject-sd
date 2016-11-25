var $APP = $APP || {};
$APP.server = 'http://proproject.artsoft-consult.ro';
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
