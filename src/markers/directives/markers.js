angular.module('leaflet-ng-markers').directive('lfMarkers', ['leafletData', '$q', '$log', function (leafletData, $q, $log) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        controller: function ($scope) {
            $scope._leafletMarkers = $q.defer();
            this.getMarkers = function () {
                return $scope._leafletMarkers.promise;
            };
        },
        link: function (scope, element, attrs, ctrl) {
            var leafletScope = ctrl.getScope(),
                markers = leafletScope.lfMarkers, leafletMarkers;

            ctrl.getMap().then(function (map) {
                var mapId = attrs.id;
                leafletMarkers = leafletData.get('markers', mapId);
                leafletMarkers = angular.isDefined(leafletMarkers) ? leafletMarkers : {};
                scope._leafletMarkers.resolve(leafletMarkers);

                leafletScope.$watch('lfMarkers', function (newMarkers, oldMarkers) {
                    angular.forEach(leafletMarkers, function (m, key) {
                        if (!angular.isDefined(newMarkers[key])) {
                            map.removeLayer(m);
                            delete leafletMarkers[key];
                        }
                    });

                    angular.forEach(newMarkers, function (params, key) {
                        var latLng = L.latLng([params.lat, params.lng]), m;

                        if (!angular.isDefined(leafletMarkers[key])) {
                            m = L.marker(latLng, params.options).addTo(map);
                            map.addLayer(m);
                            leafletMarkers[key] = m;
                        } else {
                            m = leafletMarkers[key];
                            m.setLatLng(latLng);
                            angular.extend(m.options, params.options);
                            m.update();
                        }
                    });

                }, true);

                leafletData.set('markers', leafletMarkers, mapId);

            });
        }
    };
}]);
