'use strict';
angular.module('toddlytics').factory('actionsService', function ($http, $q, API_URL) {

    var action = '';
    return {

        createNewAction: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        setMyAction: function (data) {
            action = data;
        },

        getMyAction: function () {
            return action;
        },

        getSchoolList: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getListOfActions: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getStaffList: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getApprovalByManagerId: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getApprovalByContactId: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        updateApproval: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },
        eTracking: function(param) {
            return $http.post(API_URL + 'app/e_tracking', param);
        },
        dTracking: function(param) {
            return $http.post(API_URL + 'app/d_tracking', param);
        }
    }
});