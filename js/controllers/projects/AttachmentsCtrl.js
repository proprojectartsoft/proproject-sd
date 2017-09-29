sdApp.controller('AttachmentsCtrl', AttachmentsCtrl);

AttachmentsCtrl.$inject = ['$scope', '$state', '$cordovaCamera', '$timeout', '$filter',
    '$rootScope', 'SettingService', '$ionicScrollDelegate', '$ionicPopup'
];

function AttachmentsCtrl($scope, $state, $cordovaCamera, $timeout, $filter,
    $rootScope, SettingService, $ionicScrollDelegate, $ionicPopup) {
    var vm = this;
    vm.go = go;
    vm.takePicture = takePicture;
    vm.addPicture = addPicture;
    vm.removePicture = removePicture;
    vm.testPicture = testPicture;
    vm.populate = populate;
    vm.returnToGallery = returnToGallery;
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.projectId = sessionStorage.getObject('projectId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.filter = {};
    vm.dataToDelete = [];
    vm.dataToUpdate = [];
    vm.filter.substate = 'gallery';
    var backupPic = null;
	if (!$rootScope.currentSD) return $rootScope.go('app.home', {}, true);
	vm.pictures = $rootScope.currentSD.attachments.pictures;
    populate();
    pullDown();
    goToTop();
    $scope.$watch(function() {
        if (vm.editMode) SettingService.show_focus();
    });

    function populate() {
        angular.forEach(vm.pictures, function(value) {
            //create the src for the attachment by concatenating the serevr path, the directory and the image path
            if (!value.url) {
                value.url = $APP.server + '/pub/siteDiaryPhotos/' + value.path;
            }
        });
    }

    function testPicture(pic) {
        vm.filter.substate = 'pic';
        backupPic = angular.copy(pic);
        vm.filter.picture = pic;
        goToTop();
    }

    function takePicture() {
        if (!Camera) return false;
        var options = {
            quality: 40,
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
                var pic = {
                    base_64_string: imageData,
                    site_diary_id: vm.diaryId,
                    file_name: "",
                    title: "",
                    project_id: vm.projectId
                };
                vm.pictures.push(pic);
                // vm.filter.picture = vm.pictures[vm.pictures.length - 1];
                vm.filter.state = 'form';
                pullDown();
            });
        }, function(err) {});
    }

    function addPicture() {
        if (!Camera) return false;
        var options = {
            maximumImagesCount: 1,
            quality: 40,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            correctOrientation: true,
            allowEdit: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            $timeout(function() {
                var pic = {
                    base_64_string: imageData,
                    site_diary_id: vm.diaryId,
                    file_name: "",
                    title: "",
                    project_id: vm.projectId
                };
                vm.pictures.push(pic);
                // vm.filter.picture = vm.pictures[vm.pictures.length - 1];
                vm.filter.state = 'form';
                pullDown();
            });
        }, function(err) {});
    }

    function removePicture(pic, index) {
      var popup = $ionicPopup.alert({
					title: "Are you sure",
					template: "<center>you want to delete it?</center>",
					content: "",
					buttons: [{
						text: 'Ok',
						type: 'button-positive',
						onTap: function (e) {
              if (pic.id) {
                  var idPic = {
                      id: pic.id
                  };
                  vm.dataToDelete.push(idPic);
              }
              vm.pictures.splice(index, 1);
              pullDown();
							popup.close();
						}
					},
          {
          text: 'Cancel',
          onTap: function (e) {
            popup.close();
          }
          }]
				});

    }

    function returnToGallery() {
        goToTop();
        pullDown();
        var input = $('input'),
            textarea = $('textarea');
        input.prev().removeClass("focus");
        input.removeClass("focus");
        textarea.prev().removeClass("focus");
        textarea.removeClass("focus");
        if ((backupPic.comment != vm.filter.picture.comment || backupPic.title != vm.filter.picture.title) && vm.dataToUpdate.indexOf(vm.filter.picture) == -1) {
            vm.dataToUpdate.push(vm.filter.picture);
        }
        vm.filter.substate = 'gallery';
    }

    function go(predicate, id) {
        $rootScope.currentSD.attachments = {
            pictures: vm.pictures,
            toBeDeleted: vm.dataToDelete,
            toBeUpdated: vm.dataToUpdate
        };
        if (vm.filter.substate === 'pic') {
            //go back from view full picture
            returnToGallery();
        } else if (vm.diaryId) {
            //go back for existing diary
            $rootScope.go('app.' + predicate, {
                id: vm.diaryId
            });
        } else {
            //go back for a new diary
            $rootScope.go('app.' + predicate, {
                id: id
            });
        }
    }

    function pullDown() {
        $('html').css({
            'visibility': 'hidden'
        });

        angular.element(document).ready(function() {
            $timeout(function() {
                $('.pull-down').each(function() {
                    var $this = $(this);
                    var h = $this.parent().height() - $this.height() - $this.next().height();
                    $this.css({
                        'padding-top': h
                    });
                });
                document.getElementsByTagName("html")[0].style.visibility = "visible";
            }, 100);
        })
    }

    function goToTop() {
        $timeout(function() { // we need little delay
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
        });
    }
}
