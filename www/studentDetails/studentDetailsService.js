'use strict';
angular.module('toddlytics').factory('studentDetailsService', function ($http, $q, API_URL) {

  var student = '';

  return {

    setStudent: function (data) {
      student = data
    },

    getStudent: function () {
      return student;
    },
    
    removeStudent: function () {
      student = '';
    },

    getStudentInfoById: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    c_tracking_list: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    getMenuAndMeals: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    }
  }
});
