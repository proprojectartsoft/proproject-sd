angular.module($APP.name).controller('GoodsUsedCtrl', GoodsUsedCtrl)

GoodsUsedCtrl.$inject = ['$rootScope', '$state', '$stateParams', 'SiteDiaryService', '$indexedDB', '$filter', '$ionicPopup'];

function GoodsUsedCtrl($rootScope, $state, $stateParams, SiteDiaryService, $indexedDB, $filter, $ionicPopup) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;

    vm.diaryId = localStorage.getObject('diaryId');
    vm.editMode = localStorage.getObject('editMode');
    vm.create = localStorage.getObject('sd.diary.create');
    //if create is not loaded correctly, redirect to home and try again
    if (vm.create == null || vm.create == {}) {
        var errPopup = $ionicPopup.show({
            title: "Error",
            template: '<span>An unexpected error occured and Site Diary did not load properly.</span>',
            buttons: [{
                text: 'OK',
                type: 'button-positive',
                onTap: function(e) {
                    errPopup.close();
                }
            }]
        });
        $state.go('app.home');
    }
    vm.index = $stateParams.id;
    vm.goods = vm.create.goods_received[vm.index].goods_details;

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            var syncPopup = $ionicPopup.show({
                title: 'You are offline',
                template: "<center>You can remove goods while online.</center>",
                content: "",
                buttons: [{
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function(e) {
                        syncPopup.close();
                    }
                }]
            });
            return;
        }
        vm.create.goods_received[vm.index].goods_details.forEach(function(el, i) {
            if (el === entry) {
                vm.create.goods_received[vm.index].goods_details.splice(i, 1);
            }
        })
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.data.goods_received[vm.index].goods_details = vm.create.goods_received[vm.index].goods_details;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
        SiteDiaryService.update_diary(vm.create);
        var seen = localStorage.getObject('sd.seen');
        seen.good = true;
        localStorage.setObject('sd.seen', seen);
    }

    function saveChanges(project) {
        $indexedDB.openStore('projects', function(store) {
            store.upsert(project).then(
                function(e) {},
                function(err) {
                    var offlinePopup = $ionicPopup.alert({
                        title: "Unexpected error",
                        template: "<center>An unexpected error occurred while trying to update Site Diary.</center>",
                        content: "",
                        buttons: [{
                            text: 'Ok',
                            type: 'button-positive',
                            onTap: function(e) {
                                offlinePopup.close();
                            }
                        }]
                    });
                }
            )
        })
    }

    function go(predicate, id, index) {
        $state.go('app.' + predicate, {
            id: id,
            index: index
        });
    }
}
