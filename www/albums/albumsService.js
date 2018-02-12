'use strict';
angular.module('toddlytics').factory('albumsService', function ($http, $q, API_URL) {

  var photos = [];

  return {
    getAlbumByOrgId: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    getAlbumByStudentId: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    getPhotoByAlbum: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam
      };
      return $http(req);
    },
    uploadPhoto: function (objParam, APIname) {
      var req = {
        method: "POST",
        url: API_URL + APIname,
        data: objParam,
        //headers: {'Content-type': 'multipart/form-data'}
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      };
      return $http(req);
    },
    setPhotosData: function (data) {
      photos = data;
    },
    getPhotosData: function () {
      return photos;
    },
    deletePhoto: function(obj, API) {
      return $http.post(API_URL + API, obj).then(function(resp) {
        return resp;
      });
    }
  }
});
