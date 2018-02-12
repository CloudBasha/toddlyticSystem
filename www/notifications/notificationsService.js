'use strict';
angular.module('toddlytics').factory('notifyService', function ($http, $q, API_URL) {

  var msgData = {};

  return {
    
    getParentNotifications: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    changeMessageStatus: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    
    changeNotificationStatus: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    getSentNotifications: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    getInboxMessages: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    getTagEnrollments: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    createMessage: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    createAnnouncement: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },

    getNotification: function () {
      return msgData;
    },

    setNotification: function (data) {
      msgData = data;
    }
  }
});
