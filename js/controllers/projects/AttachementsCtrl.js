angular.module($APP.name).controller('AttachementsCtrl', AttachementsCtrl)

AttachementsCtrl.$inject = ['$state', '$cordovaCamera', '$timeout', '$filter', 'AttachmentsService', '$rootScope'];

function AttachementsCtrl($state, $cordovaCamera, $timeout, $filter, AttachmentsService, $rootScope) {
    var vm = this;
    vm.go = go;
    vm.takePicture = takePicture;
    vm.addPicture = addPicture;
    vm.removePicture = removePicture;
    vm.testPicture = testPicture;
    vm.populate = populate;
    vm.returnToGallery = returnToGallery;
    vm.diaryId = localStorage.getObject('diaryId');
    vm.projectId = localStorage.getObject('projectId');
    vm.editMode = localStorage.getObject('editMode');

    vm.pictures = [];
    vm.filter = {};
    vm.imgURI = [];
    vm.dataToDelete = [];
    vm.dataToUpdate = [];
    vm.filter.substate = 'gallery';

    vm.populate();
    pullDown();

    function populate() {
        vm.attachments = localStorage.getObject('sd.attachments');
        vm.pictures = vm.attachments.pictures;
        angular.forEach(vm.pictures, function(value) {
            if (!value.url) {
                value.url = $APP.server + '/pub/siteDiaryPhotos/' + value.path;
            }
            if (!value.base64String) {
                value.base64String = $APP.server + '/pub/siteDiaryPhotos/' + value.path;
            }
        });
    }

    function testPicture(pic) {
        vm.filter.substate = 'pic';
        vm.filter.picture = pic;
    }

    function takePicture() {
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
                    "path": "",
                    "base_64_string": imageData,
                    "comment": "",
                    "tags": "",
                    "site_diary_id": vm.diaryId,
                    "file_name": "",
                    "title": "",
                    "project_id": vm.projectId
                }
                vm.pictures.push(pic);
                vm.filter.picture = vm.pictures[vm.pictures.length - 1];
                vm.filter.state = 'form';
                pullDown();
            });
        }, function(err) {});
    };

    function addPicture() {
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
                    "path": "",
                    "base_64_string": imageData,
                    "comment": "",
                    "tags": "",
                    "site_diary_id": vm.diaryId,
                    "file_name": "",
                    "title": "",
                    "project_id": vm.projectId
                }
                vm.pictures.push(pic);
                vm.filter.picture = vm.pictures[vm.pictures.length - 1];
                vm.filter.state = 'form';
                pullDown();
            });
        }, function(err) {});
    }

    function removePicture(pic, index) {
        if (pic.id) {
            var idPic = {
                id: pic.id
            }
            vm.dataToDelete.push(idPic);
        }
        vm.pictures.splice(index, 1);
        pullDown();
    }

    function returnToGallery() {
        pullDown();
        //save title and comments TODO:
        var crtPic = $filter('filter')(vm.pictures, {
            id: vm.filter.picture.id
        })[0];
        var upd = '';
        if (upd = $filter('filter')(vm.dataToUpdate, {
                id: vm.filter.picture.id
            })[0]) {
            upd = crtPic;
        } else {
            vm.dataToUpdate.push(crtPic);
        }
        vm.filter.substate = 'gallery';
    }

    function go(predicate, id) {
        vm.backup = angular.copy(vm.attachments);
        vm.attachments = {
            pictures: vm.pictures,
            toBeDeleted: vm.dataToDelete,
            toBeUpdated: vm.dataToUpdate
        }
        if(vm.editMode && JSON.stringify(vm.attachments) !==  JSON.stringify(vm.backup)) {
          $rootScope.seen.attachment = true;
        }
        console.log(vm.attachments);
        localStorage.setObject('sd.attachments', vm.attachments);
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

    function pullDown() {
        $('html').css({
            'visibility': 'hidden'
        });

        angular.element(document).ready(function() {
            $timeout(function() {
                console.log("wait");
                $('.pull-down').each(function() {
                    var $this = $(this);
                    var h = $this.parent().height() - $this.height() - $this.next().height();
                    $this.css({
                        'padding-top': h
                    });
                })
                document.getElementsByTagName("html")[0].style.visibility = "visible";
            }, 100);
        })
    }
}
