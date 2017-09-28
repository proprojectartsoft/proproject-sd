sdApp.controller('OhsCtrl', OhsCtrl);

OhsCtrl.$inject = ['$state', '$stateParams', '$scope', 'SettingService', 'PostService', '$rootScope'];

function OhsCtrl($state, $stateParams, $scope, SettingService, PostService, $rootScope) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;
    vm.local = {};
    vm.local.type = 'ohs.type';
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.index = $stateParams.id;
    vm.currentOhs = {};
	if (!$rootScope.currentSD) return $rootScope.go('app.home', {}, true);
    vm.tools = $rootScope.currentSD.oh_and_s;

    if (!isNaN(vm.index) && !(vm.index === null)) {
        vm.currentOhs = $rootScope.currentSD.oh_and_s[vm.index];
    }

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    vm.types = [{ //TODO:retrieve from DB
        id: 0,
        name: 'Toolbox Talk'
    }, {
        id: 1,
        name: 'Safety Walk'
    }, {
        id: 2,
        name: 'Incident/Accident Report'
    }, {
        id: 3,
        name: 'PPE Discussion'
    }];

    function save() {
        vm.newType = $rootScope.selected;
        var req = vm.currentOhs;
        req.type = {
            id: vm.newType && vm.newType[0].id || '',
            name: vm.newType && vm.newType[0].name || ''
        };
        if (vm.index !== 'create') {
            $rootScope.currentSD.oh_and_s[vm.index] = req;
        } else {
            $rootScope.currentSD.oh_and_s.push(req);
        }
        vm.tools = $rootScope.currentSD.oh_and_s;
    }

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove OH and S while online.</center>");
            return;
        }
        $('.item-content').css('transform', '');
        $rootScope.currentSD.oh_and_s.forEach(function(el, i) {
            if (el === entry) {
                $rootScope.currentSD.oh_and_s.splice(i, 1);
            }
        });
        vm.tools = $rootScope.currentSD.oh_and_s;
        PostService.post({
            url: 'sitediary',
            method: 'PUT',
            data: $rootScope.currentSD
        }, function(result) {}, function(error) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        })
    }

    function go(predicate, id) {
        if (predicate === "ohs" && ($rootScope.selected || vm.type)) {
            save();
        }
        $rootScope.selected = undefined;
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

//directive for textarea so it can wrap the text and be scaleble
sdApp.directive('elastic', [
    '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
            link: function autoResizeLink(scope, element, attributes, controller) {

                element.css({
                    'height': '45px',
                    'overflow-y': 'hidden'
                });
                $timeout(function() {
                    element.css('height', 45 + 'px');
                }, 100);

                element.on('input', function() {
                    element.css({
                        'height': '45px',
                        'overflow-y': 'hidden'
                    });
                    element.css('height', element[0].scrollHeight + 'px');
                });
            }
        };
    }
]);
