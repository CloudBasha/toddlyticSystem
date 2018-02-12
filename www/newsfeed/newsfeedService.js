'use strict';
angular.module('toddlytics').factory('NewsfeedService', function ($http, $q, API_URL) {
    return {
        getPicture: function (options) {
            var q = $q.defer();

            console.log(options);

            navigator.camera.getPicture(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            }, options);

            return q.promise;
        },

        getNewsfeeds: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam,
                timeout : 30000
            };
            return $http(req);
        },
      
        getParentNewsfeeds: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam,
                timeout : 30000
            };
            return $http(req);
        }
    }
});