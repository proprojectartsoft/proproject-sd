angular.module($APP.name).controller('AttachementsCtrl', AttachementsCtrl)

AttachementsCtrl.$inject = ['$state', '$cordovaCamera', '$timeout', 'AttachmentsService', '$ionicPopup'];

function AttachementsCtrl($state, $cordovaCamera, $timeout, AttachmentsService, $ionicPopup) {
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
    vm.filter.substate = 'gallery';

    $timeout(function() {
        $('.pull-down').each(function() {
            var $this = $(this);
            console.log("each attachement");
            var h = $this.parent().height() - $this.height() - $this.next().height();
            $this.css('padding-top', h);
        })
    }, 100);

    function populate() {
        vm.attachments = localStorage.getObject('sd.attachments');
        vm.pictures = vm.attachments.pictures;
        angular.forEach(vm.pictures, function(value) {
            if (!value.url) {
                value.url = $APP.server + '/pub/siteDiaryPhotos/' + value.path;
            }
        });
    }

    vm.populate();

    function testPicture(pic) {
        vm.filter.substate = 'pic';
        vm.filter.picture = pic;
    }

    function takePicture() {
        var options = {
            quality: 20,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.PNG,
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
            });
        }, function(err) {
            var attachementPopup = $ionicPopup.alert({
                title: "Take pictures",
                template: "<center>Some unexpected error occured while trying to add pictures.</center>",
                content: "",
                buttons: [{
                    text: 'Ok',
                    type: 'button-positive',
                    onTap: function(e) {
                        attachementPopup.close();
                    }
                }]
            });
        });
    };

    function addPicture() {
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
            });
        }, function(err) {
            var attachementPopup = $ionicPopup.alert({
                title: "Add pictures",
                template: "<center>Some unexpected error occured while trying to add pictures.</center>",
                content: "",
                buttons: [{
                    text: 'Ok',
                    type: 'button-positive',
                    onTap: function(e) {
                        attachementPopup.close();
                    }
                }]
            });
        });
    }

    function removePicture(pic, index) {
        if (pic.id) {
            var idPic = {
                id: pic.id
            }
            vm.dataToDelete.push(idPic);
        }
        vm.pictures.splice(index, 1);
    }

    function returnToGallery() {
        vm.filter.substate = 'gallery';
    }

    function go(predicate, id) {
        vm.attachments = {
            pictures: vm.pictures,
            toBeDeleted: vm.dataToDelete
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
}
