'use strict';
angular.module('toddlytics').factory('gettingStartedService', function ($http, $q, API_URL) {

    return {
        gettingStarted: function(data) {
            return $http.post(API_URL + 'cms/gettingStarted', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        }
    };
});