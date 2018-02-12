'use strict';
angular.module('toddlytics').factory('billingService', function ($http, $q, API_URL) {

    return {
        getStudentInvoice: function(data) {
            return $http.post(API_URL + 'app/p_getStudentInvoice', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        }
    };
});