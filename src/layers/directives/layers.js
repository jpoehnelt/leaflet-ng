angular.module('leaflet-ng-layers', ['leaflet-ng-core']).run(['leafletLayers', function (leafletLayers) {
    leafletLayers.set('xyz', {
        mustHaveUrl: true,
        createLayer: function (params) {
            return L.tileLayer(params.url, params.options);
        }
    });

    // can be expanded as necessary


}]).directive('layers', ['leafletLayers', 'leafletData', '$q', function (leafletLayers, leafletData, $q) {
    var layerTypes = leafletLayers.getAll();

    function isLayerValid(layer) {
        // Check if the baselayer has a valid type
        if (!angular.isString(layer.type)) {
            $log.error('[leaflet-ng-core] A layer must have a valid type defined.');
            return false;
        }

        if (!angular.isDefined(layer.type)) {
            $log.error('[leaflet-ng-core] A layer must have a valid type: ' + Object.keys(layerTypes));
            return false;
        }

        // Check if the layer must have an URL
        if (layerTypes[layer.type].mustHaveUrl && !angular.isString(layer.url)) {
            $log.error('[leaflet-ng-core] A base layer must have an url');
            return false;
        }

        if (layerTypes[layer.type].mustHaveData && !angular.isDefined(layer.data)) {
            $log.error('[leaflet-ng-core] The base layer must have a "data" array attribute');
            return false;
        }

        if (layerTypes[layer.type].mustHaveLayer && !angular.isDefined(layer.layer)) {
            $log.error('[leaflet-ng-core] The type of layer ' + layer.type + ' must have an layer defined');
            return false;
        }

        if (layerTypes[layer.type].mustHaveBounds && !angular.isDefined(layer.bounds)) {
            $log.error('[leaflet-ng-core] The type of layer ' + layer.type + ' must have bounds defined');
            return false;
        }

        if (layerTypes[layer.type].mustHaveKey && !angular.isDefined(layer.key)) {
            $log.error('[leaflet-ng-core] The type of layer ' + layer.type + ' must have key defined');
            return false;
        }
        $log.debug('layer is valid');
        return true;
    }

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
                layers = leafletScope.layers,
                leafletLayers = {};

            ctrl.getMap().then(function (map) {
                var mapId = attrs.id;

                scope._leafletLayers.resolve(leafletLayers);
                leafletData.set('layers', leafletLayers, mapId);

                leafletLayers.baselayers = {};
                leafletLayers.overlays = {};

                angular.forEach(layers.overlays, function (overlay, layerName) {
                    var leafletOverlay = layerTypes[overlay.type].createLayer(overlay.params);

                    if (!angular.isDefined(leafletOverlay)) {
                        delete layers.overlays[layerName];
                        return;
                    }
                    leafletLayers.overlays[layerName] = leafletOverlay;

                    if (overlay.visible) {
                        map.addLayer(leafletOverlay);
                    }
                });


                leafletScope.$watch('layers.baselayers', function (newBaselayers, oldBaselayers) {
                    console.log(newBaselayers, oldBaselayers);
                }, true);

                leafletScope.$watch('layers.overlays', function (newOverlays, oldOverlays) {
                    // TODO !!!!!!
                    // remove layers that are no longer in scope
                    angular.forEach(oldOverlays, function (overlay, layerName) {
                        if (!angular.isDefined(newOverlays[layerName])) {
                            map.removeLayer(leafletLayers.overlays[layerName])
                        }
                    });

                    // modify or add other layers
                    angular.forEach(newOverlays, function (overlay, layerName) {
                        var leafletOverlay;

                        // create if it does not exist
                        if (!angular.isDefined(leafletLayers.overlays[layerName])) {
                            leafletOverlay = layerTypes[overlay.type].createLayer(overlay.params);

                            if (!angular.isDefined(leafletOverlay)) {
                                delete layers.overlays[layerName];
                                return;
                            }
                            leafletLayers.overlays[layerName] = leafletOverlay;
                        } else {
                            angular.equals(newOverlays[layerName], oldOverlays[layerName])
                        }

                        if (overlay.visible) {
                            map.addLayer(leafletOverlay);
                        }

                    });


                }, true);

//
            });
        }
    };

}]);
