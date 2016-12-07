angular.module($APP.name).controller('AttachementsCtrl', AttachementsCtrl)

AttachementsCtrl.$inject = ['$state','$cordovaCamera','$timeout'];

function AttachementsCtrl($state,$cordovaCamera,$timeout) {
    var vm = this;
    vm.go = go;
    vm.takePicture = takePicture;
    vm.diaryId = localStorage.getObject('diaryId');

    vm.pictures = [];
    vm.filter = {};
    vm.imgURI = [];
    vm.takePicture = function () {
      var options = {
        quality: 20,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: true,
        correctOrientation: true
      };

      $cordovaCamera.getPicture(options).then(function (imageData) {
        $timeout(function () {
          // var alertPopup = $ionicPopup.alert({
          //   title: 'Form gallery',
          //   template: 'Photo added. Check form gallery for more options.'
          //});
          vm.imgURI.push({
            "id": 0,
            "base64String": imageData,
            "comment": "",
            "tags": "",
            "title": " ",
            "projectId": 0,
            "formInstanceId": 0
          })
          vm.filter.picture = vm.imgURI[vm.imgURI.length - 1];
          vm.filter.state = 'form';
          vm.filter.substate = null;
        });
      }, function (err) {
        // An error occured. Show a message to the user
      });
    };

    function go(predicate, id) {
      if((vm.diaryId) && (predicate ==='diary')){
        $state.go('app.' + predicate, {
            id: vm.diaryId
        });
      }else{
        $state.go('app.' + predicate, {
            id: id
        });
      }
    }
}
