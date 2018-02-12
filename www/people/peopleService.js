'use strict';
angular.module('toddlytics').factory('peopleService', function ($http, $q, API_URL) {

    var info = {type: '', info: '', prevPage: ''};

    return {

        setPersonInfo: function (details) {
            info = details;
        },

        getPersonInfo: function () {
            return info;
        },

        getStudentsList: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getContactsList: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getContactsByOrgIdAndType: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        },

        getProgramList: function (objParam, APIname) {
            var req = {
                method: "POST",
                url: API_URL + APIname,
                data: objParam
            };
            return $http(req);
        }
    }
});