angular.module('leaflet-ng-core').factory('leafletData', ['$q', function ($q) {
    var _data = {};


    function defaultMap(mapId) {
        if (!angular.isDefined(mapId)) {
            return 'main';
        } else {
            return mapId;
        }
    }

    function set(key, obj, mapId) {
        var q = $q.defer();
        mapId = defaultMap(mapId);
        if (!angular.isDefined(_data[key])) {
            _data[key] = {}
        }
        _data[key][mapId] = obj;
        return q.promise;
    }

    function get(key, mapId) {
        var q = $q.defer();
        mapId = defaultMap(mapId);

        if (!angular.isDefined(_data[key]) || !angular.isDefined(_data[key][mapId])) {
            q.reject();
        } else {
            q.resolve(_data[key][mapId]);
        }
        return q.promise;
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
