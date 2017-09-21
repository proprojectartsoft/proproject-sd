sdApp.directive('deSelect', myExample);

function myExample() {
    var directive = {
        restrict: 'EA',
        templateUrl: 'templates/directives/select.html',
        scope: {
            deOptions: '=',
            deSelected: '=',
            deTitle: '=',
            deParameter: '='
        },
        controller: ExampleController,
        controllerAs: 'vms',
        bindToController: true
    };
    return directive;
}

ExampleController.$inject = ['$ionicScrollDelegate', '$timeout', '$rootScope'];

function ExampleController($ionicScrollDelegate, $timeout, $rootScope) {
    var vms = this;
    vms.toggle = toggle;
    vms.getHeight = getHeight;
    vms.getTitle = getTitle;
    vms.select = select;
    vms.parameter = '';

    vms.settings = {};
    vms.settings.show = false;
    vms.localPath = 'sd.diary.' + vms.deTitle;
    vms.settings.placeholderActive = 'Choose your option';
    vms.settings.placeholderClosed = 'Tap to choose an option';
    getHeight()

    function toggle() {
        vms.settings.show = !vms.settings.show;
        getHeight()
    }

    function getHeight() {
        if (vms.settings.show && vms.deOptions) {
            vms.settings.containerHeight = vms.deOptions.length * 40 + 'px';
        } else {
            vms.settings.containerHeight = '0px';
        }
        //wait for toggle animation to finish so we can refresh the scroll height
        $timeout(function() {
            $ionicScrollDelegate.resize();
        }, 300);
        getTitle()
    }

    function getTitle() {
        if (vms.settings.show) {
            vms.settings.title = vms.settings.placeholderActive;
        } else {
            vms.settings.title = vms.deSelected || vms.settings.placeholderClosed;
        }
    }
    vms.selected = [];
    //if some values are already selected
    if (vms.deParameter) {
        vms.selected = vms.deParameter;
    }

    function select(option) {
        var index = -1;
        if ((vms.deTitle === 'weather.morning') ||
            (vms.deTitle === 'weather.midday') ||
            (vms.deTitle === 'weather.afternoon') ||
            (vms.deTitle === 'weather.evening') ||
            (vms.deTitle === 'weather.onOff') ||
            (vms.deTitle === 'weather.allDay')) {
            angular.forEach(vms.selected, function(value, key) {
                if (option.name === value.name) {
                    index = key;
                }
            })
            if (index === -1) {
                //add selected values
                vms.selected.push(option);
            } else {
                //remove selected values
                vms.selected.splice(index, 1);
            }
            console.log("weather select changed");
        } else {
            vms.selected = [];
            vms.selected.push(option);
        }
        vms.settings.placeholderActive = vms.selected;
        sessionStorage.setObject(vms.localPath, vms.selected);
        $rootScope.selected = vms.selected;
        toggle();
    }
}

// de-options - list of objects for the select
// de-selected - the current selected object
