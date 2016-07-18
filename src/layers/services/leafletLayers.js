angular.module('leaflet-ng-layers').factory('leafletLayers', ['$log', function ($log) {
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
