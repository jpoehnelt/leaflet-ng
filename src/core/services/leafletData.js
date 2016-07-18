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
