'use strict';
angular.module('toddlytics').factory('kidsService', function ($http, $q, API_URL) {

    return {
        update: function(data) {
            return $http.post(API_URL + 'cms/updateStudent', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        },
        create: function(data) {
            return $http.post(API_URL + 'cms/c_student', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        },
        refreshStudents: function(data) {
            return $http.post(API_URL + 'app/p_listStudent', data).then(function (resp) {
                return resp.data;
            }, function (err) {
                return err;
            });
        }
      
      
    };
});
