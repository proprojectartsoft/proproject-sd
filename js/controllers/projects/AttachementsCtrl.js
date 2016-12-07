angular.module($APP.name).controller('AttachementsCtrl', AttachementsCtrl)

AttachementsCtrl.$inject = ['$state','$cordovaCamera','$timeout','AttachmentsService'];

function AttachementsCtrl($state,$cordovaCamera,$timeout, AttachmentsService) {
    var vm = this;
    vm.go = go;
    vm.takePicture = takePicture;
    vm.diaryId = localStorage.getObject('diaryId');
    vm.projectId = localStorage.getObject('projectId');

    vm.pictures = [];
    vm.filter = {};
    vm.imgURI = [];
    function takePicture()  {
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
          var pic = [{
            "path": "",
            "base_64_string": imageData,
            "comment": "",
            "tags": "",
            "site_diary_id": vm.diaryId,
            "file_name": "",
            "title": "",
            "project_id": vm.projectId
          }]
          AttachmentsService.upload_attachments(pic).then(function(result){
            console.log(result);
          })
          vm.imgURI.push(pic);
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
