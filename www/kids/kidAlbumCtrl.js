'use strict';
angular.module('toddlytics')
.controller('kidAlbumCtrl', function ($scope, $state, $rootScope, albumsService, GlobalService, $log) {

    var loginResponse = $rootScope.loginResponse;
    var contactResponse = $rootScope.contactResponse;

    $scope.albumsWithCovers = [];
    $rootScope.getAlbum = {Id: ''};


    $rootScope.sendPhotoToAlbum = function (albumId) {
      $rootScope.disableSave = true;
      function success(file) {
        $scope.fileUpload = file;
        var fileUploadOptions = new FormData();
        $log.debug("Photo ", file);
        window.resolveLocalFileSystemURL(file.localURL, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
              var imgBlob = new Blob([this.result], {type: "image/jpeg"});
              imgBlob.name = "fileName";
              $log.debug("CHECK FILE ", imgBlob);
              fileUploadOptions.append('albumId', albumId.toString());
              fileUploadOptions.append('studentId', loginResponse.organizationId.toString());
              fileUploadOptions.append('contactEmail', loginResponse.organizationId.toString());
              fileUploadOptions.append("studentLogo", imgBlob, file.name);

              /*for (var [key, value] of fileUploadOptions.entries()) {
               $log.debug(key, value);
               }*/

              var APIname = '/cms/uploadStudentLogo';


              albumsService.uploadPhoto(fileUploadOptions, APIname).then(function (response) {
                $log.debug("Upload Photo Response ", response);
                if (typeof response.status && response.status === 422) {
                  GlobalService.hideLoading();
                  GlobalService.showToast("Error Occurred", 'long', 'bottom');
                }
                else {
                  if (angular.isDefined(response) && response.data !== '' && response.status == 200) {
                    GlobalService.showToast("Photo Saved Successfully", 'long', 'bottom');
                    $state.go('app.albums');
                  }
                  else {
                    GlobalService.showToast("Error Occurred " + response, 'long', 'bottom');
                  }
                }
              });
            };
            reader.readAsArrayBuffer(file);

          }, function (e) {
            $scope.errorHandler(e)
          });
        }, function (e) {
          $scope.errorHandler(e)
        });
      }

      function fail(error) {
        alert("Unable to retrieve file properties: " + error.code);
      }

      // obtain properties of a file
      $rootScope.imageFileEntry.file(success, fail)
    };

    // function getAlbumByOrgId() {

    //   var getAlbum = {
    //     orgId: loginResponse.organizationId
    //   };

    //   var APIname = 'app/getAlbumByOrgId';

    //   albumsService.getAlbumByOrgId(getAlbum, APIname).then(function (response) {

    //     if (typeof response.status && response.status === 422) {
    //       GlobalService.hideLoading();
    //       GlobalService.showToast("Error Occurred", 'long', 'bottom');
    //     }
    //     else {

    //       if (angular.isDefined(response) && response.data !== '' && response.status == 200) {
    //         var albums = response.data.list;
    //         var albumLength = albums.length;

    //         for (var album = 0; album < albumLength; album++) {

    //           var albumList = albums[album].albumList;

    //           for (var i = 0; i < albumList.length; i++) {
    //             $scope.albumsWithCovers.push(albumList[i]);
    //           }
    //         }
    //         $rootScope.getAlbum.Id = $scope.albumsWithCovers[0].albumId;
    //         GlobalService.hideLoading();
    //       }
    //       else {
    //         GlobalService.hideLoading();
    //         GlobalService.showToast("Error Occurred", 'long', 'bottom');
    //       }
    //     }
    //   });
    // }

    // function getAlbumByStudentId() {
    //     var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
    //     GlobalService.showLoading();

    //     var getAlbum = {
    //       studentId: getFavStudent.studentId.toString()
    //     };

    //     var APIname = 'app/p_getStudentPhotos';

    //     albumsService.getAlbumByStudentId(getAlbum, APIname).then(function (response) {
    //       $log.debug("Response ", response);
    //       if (typeof response.status && response.status === 422) {
    //         console.log('error');
    //       }
    //       else {

    //         if (angular.isDefined(response) && response.status == 200) {

    //           var albums = response.data.list;
    //           angular.forEach(albums, function(album){
    //             $scope.albumsWithCovers.push(album);
    //           });
    //           GlobalService.hideLoading();
    //         }
    //         else {
    //           GlobalService.hideLoading();
    //           GlobalService.showToast("Error Occurred", 'long', 'bottom');
    //         }
    //       }
    //     });
    //   }

    // if(loginResponse.type == 'ADMIN'){
    //   getAlbumByOrgId();
    // }
    // else if(loginResponse.type == 'PARENT'){
    //   var getStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
    //   if(getStudentInfo.length > 0){
    //     getAlbumByStudentId();
    //   }
    // }
  });