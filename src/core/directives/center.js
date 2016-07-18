angular.module("leaflet-ng-core").directive('lfCenter', ['leafletHelpers', function (leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        link: function (scope, element, attrs, ctrl) {
            var leafletScope = ctrl.getScope(), safeApply = leafletHelpers.safeApply;

            ctrl.getMap().then(function (map) {
                leafletScope.$watch('lfCenter', function (center) {
                    map.setView([center.lat, center.lng], center.zoom);
                }, true);

                map.on('moveend', function (/* event */) {
                    safeApply(scope, function () {
                        angular.extend(leafletScope.lfCenter, {
                            lat: map.getCenter().lat,
                            lng: map.getCenter().lng,
                            zoom: map.getZoom(),
                            autoDiscover: false
                        });
                    });
                });
            });
        }
    }
}]);
