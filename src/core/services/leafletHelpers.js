angular.module('leaflet-ng-core').factory('leafletHelpers', [function () {

    return {
        safeApply: function safeApply($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                $scope.$eval(fn);
            } else {
                $scope.$evalAsync(fn);
            }
        }
    };

}]);
