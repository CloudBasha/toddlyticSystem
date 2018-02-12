'use strict';
angular.module('toddlytics').factory('authService', function ($http, $q, API_URL, $rootScope) {
  return {

    authenticate: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    refreshLogin: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    registerPushDevice: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    getIp: function (link) {
      var req = {
        method: "GET",
        url: link
      };
      return $http(req);
    },
    
    getContactsById: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    }
  }
});
