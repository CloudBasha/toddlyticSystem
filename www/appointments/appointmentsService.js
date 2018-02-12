'use strict';
angular.module('toddlytics').factory('appointmentsService', function ($http, $q, API_URL) {

    return {
        appointmentList: function(data) {
            return $http.post(API_URL + 'app/getAppointmentsByContactId', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        },
        acceptRejectEnrollment: function(data) {
            return $http.post(API_URL + 'app/acceptRejectEnrollment', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        }
    };
});