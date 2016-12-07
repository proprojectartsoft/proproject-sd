angular.module($APP.name).controller('AttachementsCtrl', AttachementsCtrl)

AttachementsCtrl.$inject = ['$state', '$cordovaCamera', '$timeout', 'AttachmentsService'];

function AttachementsCtrl($state, $cordovaCamera, $timeout, AttachmentsService) {
    var vm = this;
    vm.go = go;
    vm.takePicture = takePicture;
    vm.addPicture = addPicture;
    vm.diaryId = localStorage.getObject('diaryId');
    vm.projectId = localStorage.getObject('projectId');

    vm.pictures = [];
    vm.filter = {};
    vm.imgURI = [];
    AttachmentsService.get_attachments(vm.diaryId).then(function(result) {
        console.log(result);
        angular.forEach(result, function (value) {
          value.path = value.path.substring(24);
          console.log(value);
          value.url = $APP.server + '/pub/siteDiaryPhotos/' + value.path
          vm.imgURI.push(value)
        });
        vm.pictures = result;
    })


    function takePicture() {
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

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $timeout(function() {
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
                AttachmentsService.upload_attachments(pic).then(function(result) {
                    console.log(result);
                })
                vm.vm.pictures.push(pic);
                vm.filter.picture = vm.vm.pictures[vm.vm.pictures.length - 1];
                vm.filter.state = 'form';
                vm.filter.substate = null;
            });
        }, function(err) {
            // An error occured. Show a message to the user
        });
    };

    function addPicture() {
        //            window.imagePicker.getPictures(
        //                    function (results) {
        //                        vm.convertToDataURLviaCanvas(results[0], function (base64Img) {
        //                            vm.item.base64String = base64Img.replace(/^data:image\/(png|jpg);base64,/, "");
        //                        });
        //                    }, function (error) {
        //            }, {
        //                maximumImagesCount: 1,
        //                width: 800,
        //                quality: 10
        //            });
        var options = {
            maximumImagesCount: 1,
            quality: 20,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true,
            allowEdit: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
                $timeout(function() {
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
                    AttachmentsService.upload_attachments(pic).then(function(result) {
                        console.log(result);
                    })
                    vm.pictures.push(pic);
                    vm.filter.picture = vm.pictures[vm.pictures.length - 1];
                    vm.filter.state = 'form';
                    vm.filter.substate = null;
                });
            });
        }


        function go(predicate, id) {
            if ((vm.diaryId) && (predicate === 'diary')) {
                $state.go('app.' + predicate, {
                    id: vm.diaryId
                });
            } else {
                $state.go('app.' + predicate, {
                    id: id
                });
            }
        }
    }
