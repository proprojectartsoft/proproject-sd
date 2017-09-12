sdApp.controller('GoodsUsedCtrl', GoodsUsedCtrl)

GoodsUsedCtrl.$inject = ['$state', '$rootScope', '$stateParams', 'SiteDiaryService', 'SyncService', 'SettingService'];

function GoodsUsedCtrl($state, $rootScope, $stateParams, SiteDiaryService, SyncService, SettingService) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.index = $stateParams.id;
    vm.goods = $rootScope.currentSD.goods_received[vm.index].goods_details;

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove goods while online.</center>");
            return;
        }
        $rootScope.currentSD.goods_received[vm.index].goods_details.forEach(function(el, i) {
            if (el === entry) {
                $rootScope.currentSD.goods_received[vm.index].goods_details.splice(i, 1);
            }
        })
        SiteDiaryService.update_diary($rootScope.currentSD);
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
