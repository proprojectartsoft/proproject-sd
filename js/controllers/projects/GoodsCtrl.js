sdApp.controller('GoodsCtrl', GoodsCtrl)

GoodsCtrl.$inject = ['$rootScope', '$state', 'SiteDiaryService', 'SettingService'];

function GoodsCtrl($rootScope, $state, SiteDiaryService, SettingService) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;
    vm.editMode = sessionStorage.getObject('editMode');
    vm.diaryId = sessionStorage.getObject('diaryId');

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove goods while online.</center>");
            return;
        }
        $rootScope.currentSD.goods_received.forEach(function(el, i) {
            if (el === entry) {
                $rootScope.currentSD.goods_received.splice(i, 1);
            }
        })
        SiteDiaryService.update_diary($rootScope.currentSD);
    }

    function go(predicate, id) {
        if ((predicate === 'diary') && (vm.diaryId)) {
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
