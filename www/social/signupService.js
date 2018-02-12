'use strict';
angular.module('toddlytics').factory('signupService', function ($http, $q, API_URL) {

    return {
        register: function(data) {
            return $http.post(API_URL + 'parent_register', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        },
        login: function(data) {
            return $http.post(API_URL + 'login', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        },
        submit_tac: function(data) {
//            var req = {
//                method: "POST",
//                url: API_URL + 'app/submitTac',
//                data: data,
//                timeout : 10000
//            };
//            return $http(req);
            return $http.post(API_URL + 'submitTac', data).then(function(resp) {
                return resp;
            });
        }
    };
});