angular.module($APP.name).controller('GoodsUsedCtrl', GoodsUsedCtrl)

GoodsUsedCtrl.$inject = ['$state', '$stateParams', 'SiteDiaryService', '$indexedDB', 'SettingService'];

function GoodsUsedCtrl($state, $stateParams, SiteDiaryService, $indexedDB, SettingService) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.index = $stateParams.id;
    $indexedDB.openStore('projects', function(store) {
        store.find(sessionStorage.getObject('projectId')).then(function(proj) {
            vm.create = proj.temp;
            //if create is not loaded correctly, redirect to home and try again
            if (vm.create == null || vm.create == {}) {
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                $state.go('app.home');
                return;
            }
            vm.goods = vm.create.goods_received[vm.index].goods_details;
        });
    });

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove goods while online.</center>");
            return;
        }
        vm.create.goods_received[vm.index].goods_details.forEach(function(el, i) {
            if (el === entry) {
                vm.create.goods_received[vm.index].goods_details.splice(i, 1);
            }
        })
        //store the new data in temp SD
        SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
        SiteDiaryService.update_diary(vm.create);
        var seen = sessionStorage.getObject('sd.seen');
        seen.good = true;
        sessionStorage.setObject('sd.seen', seen);
    }

    function go(predicate, id, index) {
        $state.go('app.' + predicate, {
            id: id,
            index: index
        });
    }
}
