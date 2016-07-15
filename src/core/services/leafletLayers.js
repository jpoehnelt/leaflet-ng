angular.module('leaflet-ng-core').factory('leafletLayers', ['$q', function ($q) {
    var _layers = {};

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
        set: set,
        get: get,
        getAll: function () { return _layers; }
    };

}]);
