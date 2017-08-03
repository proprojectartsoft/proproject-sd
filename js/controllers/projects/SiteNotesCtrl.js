angular.module($APP.name).controller('SiteNotesCtrl', SiteNotesCtrl)

SiteNotesCtrl.$inject = ['$rootScope', '$state', '$scope', 'SettingService', '$filter'];

function SiteNotesCtrl($rootScope, $state, $scope, SettingService, $filter) {
    var vm = this;
    vm.go = go;
    vm.add = add;
    vm.delays = [];
    vm.tools = [];
    vm.materials = [];
    vm.editMode = localStorage.getObject('editMode');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    $scope.autoExpand = function(e) {
        $(e.target).height(e.target.scrollHeight - 30);
    };

    function add() {
        if (vm.input1 || vm.input2 || vm.input3) {
            var seen = localStorage.getObject('sd.seen');
            seen.site = true;
            localStorage.setObject('sd.seen', seen);
        }
        if (vm.input1) {
            vm.delays.push(vm.input1);
            vm.input1 = '';
        }
        if (vm.input2) {
            vm.tools.push(vm.input2);
            vm.input2 = '';
        }
        if (vm.input3) {
            vm.materials.push(vm.input3);
            vm.input3 = '';
        }
        $('textarea').height('initial');
    }

    if (vm.diaryId) {
        if (vm.create.site_notes.delays !== null) {
            vm.delays = vm.create.site_notes.delays;
        }
        if (vm.create.site_notes.tools_used !== null) {
            vm.tools = vm.create.site_notes.tools_used;
        }
        if (vm.create.site_notes.materials_requested !== null) {
            vm.materials = vm.create.site_notes.materials_requested;
        }
    }

    function save() {
        add();
        vm.site_notes = {
            delays: vm.delays,
            tools_used: vm.tools,
            materials_requested: vm.materials
        }
        vm.create.site_notes = vm.site_notes;
        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            diary.data.site_notes = vm.site_notes;
            localStorage.setObject('currentProj', proj);
        }
        localStorage.setObject('sd.diary.create', vm.create);
        // go('diary');
    }

    if (!vm.diaryId) {
        if (vm.create.site_notes.delays) {
            vm.delays = vm.create.site_notes.delays;
        }
        if (vm.create.site_notes.tools_used) {
            vm.tools = vm.create.site_notes.tools_used;
        }
        if (vm.create.site_notes.materials_requested) {
            vm.materials = vm.create.site_notes.materials_requested;
        }
    }

    function go(predicate, id) {
        save();
        if (predicate === 'diary') {
            if (vm.diaryId) {
                $state.go('app.' + predicate, {
                    id: vm.diaryId
                });
            } else {
                $state.go('app.' + predicate);
            }
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }

    function watchChanges() {
        $("textarea").change(function() {
            var seen = localStorage.getObject('sd.seen');
            seen.site = true;
            localStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();
}
