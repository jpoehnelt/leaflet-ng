angular.module("leaflet-ng-core").directive('lfBounds', ['leafletHelpers', function (leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        link: function (scope, element, attrs, ctrl) {
            var leafletScope = ctrl.getScope(), safeApply = leafletHelpers.safeApply;

            ctrl.getMap().then(function (map) {

                map.on('moveend', function () {
                    var bounds = map.getBounds();

                    safeApply(leafletScope, function () {
                        leafletScope.lfBounds = {
                            northEast: {
                                lng: bounds.getEast(),
                                lat: bounds.getNorth()
                            },
                            southWest: {
                                lng: bounds.getWest(),
                                lat: bounds.getSouth()
                            }
                        };
                    });
                });
            });
        }
    }
}]);