angular.module('leaflet-ng-layers').directive('lfLayers', ['leafletLayers', 'leafletData', '$q', function (leafletLayers, leafletData, $q) {
    var layerTypes = leafletLayers.getAll();

    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',
        controller: function ($scope) {
            $scope._leafletLayers = $q.defer();
            this.getLayers = function () {
                return $scope._leafletLayers.promise;
            };
        },
        link: function (scope, element, attrs, ctrl) {
            var leafletScope = ctrl.getScope(),
                layers = leafletScope.lfLayers, leafletLayers;

            ctrl.getMap().then(function (map) {
                var mapId = attrs.id;
                leafletLayers = leafletData.get('layers', mapId);
                leafletLayers = angular.isDefined(leafletLayers) ? leafletLayers : {};
                leafletLayers.baselayers = angular.isDefined(leafletLayers.baselayers) ? leafletLayers.baselayers : {};
                leafletLayers.overlays = angular.isDefined(leafletLayers.overlays) ? leafletLayers.overlays : {};
                scope._leafletLayers.resolve(leafletLayers);

                leafletScope.$watch('lfLayers.baselayers', function (newBaselayers, oldBaselayers) {
                    layerCompare(newBaselayers, oldBaselayers, 'baselayers');
                }, true);

                leafletScope.$watch('lfLayers.overlays', function (newOverlays, oldOverlays) {
                    layerCompare(newOverlays, oldOverlays, 'overlays');

                }, true);

                function layerCompare(newLayers, oldLayers, type) {
                    angular.forEach(oldLayers, function (layer, layerName) {
                        if (!angular.isDefined(newLayers[layerName])) {
                            map.removeLayer(leafletLayers[type][layerName])
                        }
                    });

                    // modify or add other layers
                    angular.forEach(newLayers, function (layer, layerName) {
                        var leafletLayer;
                        // create layer if it does not exist
                        if (!angular.isDefined(leafletLayers[type][layerName])) {
                            // create layer
                            leafletLayer = layerTypes[layer.type].createLayer(layer.params);
                            // save to internal
                            leafletLayers.overlays[layerName] = leafletLayer;
                        }
                        // get the existing layer and update it if changed
                        else {
                            // get layer
                            leafletLayer = leafletLayers[type][layerName];
                            // only update based upon options
                            if (!angular.equals(newLayers[layerName].params.options, oldLayers[layerName].params.options)) {
                                angular.extend(leafletLayer.options, newLayers[layerName].params.options);
                                leafletLayer.redraw();
                            }
                        }

                        if (layer.visible) {
                            map.addLayer(leafletLayer);
                        } else {
                            map.removeLayer(leafletLayer);
                        }

                    });
                }

                leafletData.set('layers', leafletLayers, mapId);

            });
        }
    };
}]);
