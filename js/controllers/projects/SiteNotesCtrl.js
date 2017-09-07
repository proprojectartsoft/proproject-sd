sdApp.controller('SiteNotesCtrl', SiteNotesCtrl)

SiteNotesCtrl.$inject = ['$rootScope', '$state', '$scope', 'SettingService', '$filter', '$ionicPopup', 'SyncService'];

function SiteNotesCtrl($rootScope, $state, $scope, SettingService, $filter, $ionicPopup, SyncService) {
    var vm = this;
    vm.go = go;
    vm.add = add;
    vm.delays = [];
    vm.tools = [];
    vm.materials = [];
    vm.editMode = sessionStorage.getObject('editMode');
    vm.diaryId = sessionStorage.getObject('diaryId');
    $indexedDB.openStore('projects', function(store) {
        store.find(sessionStorage.getObject('projectId')).then(function(proj) {
            vm.create = proj.temp;
            //if create is not loaded correctly, redirect to home and try again
            if (vm.create == null || vm.create == {}) {
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                $state.go('app.home');
                return;
            }
            initFields();
        });
    });

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    $scope.autoExpand = function(e) {
        $(e.target).height(e.target.scrollHeight - 30);
    };

    //initialize data for site notes' fields
    function initFields() {
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
    }

    function save() {
        add();
        vm.site_notes = {
            delays: vm.delays,
            tools_used: vm.tools,
            materials_requested: vm.materials
        }
        vm.create.site_notes = vm.site_notes;
        //store the new data in temp SD
        SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
    }

    function add() {
        if (vm.input1 || vm.input2 || vm.input3) {
            var seen = sessionStorage.getObject('sd.seen');
            seen.site = true;
            sessionStorage.setObject('sd.seen', seen);
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
            var seen = sessionStorage.getObject('sd.seen');
            seen.site = true;
            sessionStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();
}
