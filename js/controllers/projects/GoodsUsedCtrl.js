sdApp.controller('GoodsUsedCtrl', GoodsUsedCtrl);

GoodsUsedCtrl.$inject = ['$state', '$rootScope', '$stateParams', 'PostService', 'SettingService'];

function GoodsUsedCtrl($state, $rootScope, $stateParams, PostService, SettingService) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.index = $stateParams.id;
    if (!$rootScope.currentSD) return $state.go('app.home', {}, {
        reload: true
    });
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
        });
        PostService.post({
            url: 'sitediary',
            method: 'PUT',
            data: $rootScope.currentSD
        }, function(result) {}, function(error) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        })
    }

    function go(predicate, id, index) {
        $state.go('app.' + predicate, {
            id: id,
            index: index
        });
    }
}
