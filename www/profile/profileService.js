'use strict';
angular.module('toddlytics').factory('profileService', function ($http, $q, API_URL) {

    return {
        update: function(data) {
            return $http.post(API_URL + 'cms/e_staff', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        },
      
        updateParent: function(data) {
            return $http.post(API_URL + 'app/e_parent', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        }
    };
});