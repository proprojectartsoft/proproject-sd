var $APP = $APP || {};
$APP.server = 'http://app.preprod.proproject.io/';
$APP.name = 'ppsd'

angular.module($APP.name, [
    'ionic',
    'angularMoment',
    'ion-datetime-picker',
    'ngCordova',
    'indexedDB',
]).config(function ($indexedDBProvider) {
    $indexedDBProvider
      .connection('Site-Diary')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('projects', {keyPath: 'id',autoIncrement: true});
        objStore.createIndex('id_idx', 'id', {unique: true});
      });
  });

angular.module($APP.name).run(apprun);

function apprun($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.StatusBar) {
            StatusBar.styleDefault();
            StatusBar.overlaysWebView(false);
        }
    });
}
