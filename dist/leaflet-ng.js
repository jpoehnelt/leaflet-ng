angular.module("leaflet-ng-core", []).directive('leaflet', ['$q', 'leafletData', function ($q, leafletData) {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            defaults: '=',
            layers: '='
        },
        transclude: true,
        template: '<div class="angular-leaflet-map"><div ng-transclude></div></div>',
        controller: function ($scope) {
            this._leafletMap = $q.defer();
            this.getMap = function () {
                return this._leafletMap.promise;
            };

            this.getScope = function () {
                return $scope;
            };
        },
        link: function (scope, element, attrs, ctrl) {

            // Create the Leaflet Map Object with the options
            var map = new L.Map(element[0], scope.defaults);
            leafletData.set('map', map, attrs.id);
            ctrl._leafletMap.resolve(map);

            console.log(scope.defaults);

            // Resolve the map object to the promises
            map.whenReady(function () {
                console.log('map ready');
                leafletData.set('map', map, attrs.id);
            });

            scope.$on('$destroy', function () {
                map.remove();
                leafletData.destroy(attrs.id);
            });

        }
    }
}]);
;
angular.module('leaflet-ng-core').factory('leafletData', [function () {
    var _data = {};

    function defaultMap(mapId) {
        if (!angular.isDefined(mapId)) {
            return 'main';
        } else {
            return mapId;
        }
    }

    function set(key, obj, mapId) {

        mapId = defaultMap(mapId);
        if (!angular.isDefined(_data[key])) {
            _data[key] = {}
        }
        _data[key][mapId] = obj;
    }

    function get(key, mapId) {
        mapId = defaultMap(mapId);
        if (angular.isDefined(_data[key]) && angular.isDefined(_data[key][mapId])) {
            return _data[key][mapId];
        }
    }

    return {
        set: set,
        get: get,
        getMap: function (mapId) {
            return get('map', mapId);
        },
        destroy: function (mapId) {
            mapId = defaultMap(mapId);

            angular.forEach(_data, function (value, key) {
                if (value.hasOwnProperty(mapId)) {
                    delete _data[key][mapId];
                }
            })
        }
    };

}]);
;
angular.module('leaflet-ng-layers').directive('layers', ['leafletLayers', 'leafletData', '$q', function (leafletLayers, leafletData, $q) {
    var layerTypes = leafletLayers.getAllDefinitions();

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
                layers = leafletScope.layers;


            ctrl.getMap().then(function (map) {
                var mapId = attrs.id;
                scope._leafletLayers.resolve(leafletLayers);

                leafletLayers = leafletData.get('layers', mapId);
                leafletLayers = angular.isDefined(leafletLayers) ? leafletLayers : {};
                leafletLayers.baselayers = {};
                leafletLayers.overlays = {};

                leafletScope.$watch('layers.baselayers', function (newBaselayers, oldBaselayers) {
                    console.log(newBaselayers, oldBaselayers);
                }, true);

                leafletScope.$watch('layers.overlays', function (newOverlays, oldOverlays) {
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
;
angular.module('leaflet-ng-layers', ['leaflet-ng-core']);
angular.module('leaflet-ng-layers').factory('leafletLayers', ['$q', function ($q) {
    // minimal set of pre-defined layers
    var _layers = {
        'xyz': {
            mustHaveUrl: true,
            createLayer: function (params) {
                return L.tileLayer(params.url, params.options);
            }
        }
    };

    function set(type, definition) {

        if (_layers.hasOwnProperty(type)) {
            $log.error('[leaflet-ng-core] Layer already defined.');
        }

        _layers[type] = definition;
    }

    function get(type) {
        return _layers[type];
    }

    return {
        setDefinitions: set,
        getDefinitions: get,
        getAllDefinitions: function () {
            return _layers;
        }
    };

}]);
