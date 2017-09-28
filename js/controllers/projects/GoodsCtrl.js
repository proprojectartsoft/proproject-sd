sdApp.controller('GoodsCtrl', GoodsCtrl);

GoodsCtrl.$inject = ['$rootScope', '$state', 'SettingService', 'PostService'];

function GoodsCtrl($rootScope, $state, SettingService, PostService) {
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
        });
        PostService.post({
            url: 'sitediary',
            method: 'PUT',
            data: $rootScope.currentSD
        }, function(result) {}, function(error) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        })
    }

    function go(predicate, id) {
        if ((predicate === 'diary') && (vm.diaryId)) {
            $rootScope.go('app.' + predicate, {
                id: vm.diaryId
            });
        } else {
            $rootScope.go('app.' + predicate, {
                id: id
            });
        }
    }
}
