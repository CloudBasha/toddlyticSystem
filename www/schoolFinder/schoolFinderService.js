'use strict';
angular.module('toddlytics').factory('schoolFinderService', function ($http, $q, API_URL) {

    return {

        getSchoolsList: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },
        makeParentAppointment: function(data) {
            return $http.post(API_URL + 'app/p_setAppointment', data).then(function(resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        }
    };
});