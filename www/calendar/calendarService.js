'use strict';
angular.module('toddlytics').factory('calendarService', function ($http, $q, API_URL, $rootScope) {
  return {

    getStudentEvents: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    getPublicEvents: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    getStudentActivities: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    getLessonPlan: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    }
  }
});
