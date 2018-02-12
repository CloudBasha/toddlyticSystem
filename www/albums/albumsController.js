'use strict';
angular.module('toddlytics')
  .controller('AlbumsCtrl',
    function ($scope, $state, albumsService, $rootScope, GlobalService, $cordovaCamera, $cordovaFile, $log, $ionicActionSheet) {

      var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;
      var getStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
      var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));

      $scope.albumsWithCovers = [];

      function getAlbumByOrgId() {

        GlobalService.showLoading();

        var getAlbum = {
          orgId: loginResponse.organizationId
        };

        var APIname = 'app/getAlbumByOrgId';

        albumsService.getAlbumByOrgId(getAlbum, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            console.log('error');
          }
          else {

            if (angular.isDefined(response) && response.status == 200) {

              var albums = response.data.list;
              var albumLength = albums.length;

              for (var album = 0; album < albumLength; album++) {

                var albumList = albums[album].albumList;

                for (var i = 0; i < albumList.length; i++) {
                  $scope.albumsWithCovers.push(albumList[i]);
                }
              }
              GlobalService.hideLoading();
            }
            else {
              GlobalService.hideLoading();
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

      function getAlbumByStudentId() {

        GlobalService.showLoading();

        var getAlbum = {
          studentId: getFavStudent.studentId.toString()
        };

        var APIname = 'app/p_getStudentPhotos';

        albumsService.getAlbumByStudentId(getAlbum, APIname).then(function (response) {
          $log.debug("Response ", response);
          if (typeof response.status && response.status === 422) {
            console.log('error');
          }
          else {

            if (angular.isDefined(response) && response.status == 200) {

              var albums = response.data.list;
              angular.forEach(albums, function(album){
                $scope.albumsWithCovers.push(album);
              });
              GlobalService.hideLoading();
            }
            else {
              GlobalService.hideLoading();
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

      $scope.getPhotoByAlbum = function (albumId) {

        GlobalService.showLoading();

        var getPhoto = {
          albumId: albumId.toString()
        };

        var APIname = 'app/getPhotoByAlbum';

        albumsService.getPhotoByAlbum(getPhoto, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            console.log('error');
          }
          else {
            if (angular.isDefined(response)) {
              var res = response.data.list;
              albumsService.setPhotosData(res);
              GlobalService.hideLoading();
              $state.go('app.photos', getPhoto);
            }
          }
        });
      };

      $scope.getParentsPhotoByAlbum = function (album) {

//        GlobalService.showLoading();
            $state.go('pApp.photos', { photos : album.photoList });
      };

      
      var hideSheet;
      $rootScope.showImageOptions = function() {

       // Show the action sheet
       hideSheet = $ionicActionSheet.show({
         buttons: [
          { text: '<span class="padding">Gallery</span>' },
           { text: '<span class="padding">Camera</span>' }
         ],
         titleText: 'Upload Picture',
         cancelText: 'Cancel',
         cancel: function() {
              // add cancel code..
            },
         buttonClicked: function(index) {
          $rootScope.takePictureAlbums(index);
         }
       });

     };


      $rootScope.takePictureAlbums = function (index) {

        document.addEventListener("deviceready", function () {
          var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: index,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1000,
            targetHeight: 1000,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
          };
          
          var cameraSuccess = function (imageData) {
          onPhotoURISuccess(imageData);

          function onPhotoURISuccess(imageURI) {
            createFileEntry(imageURI);
          }

          function createFileEntry(imageURI) {
            window.resolveLocalFileSystemURL(imageURI, copyPhoto, fail);
          }

          function copyPhoto(fileEntry) {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
              fileSys.root.getDirectory("photos", {create: true, exclusive: false}, function (dir) {
                var fileName = Math.random()+fileEntry.name;
                fileEntry.copyTo(dir, fileName, onCopySuccess, fail);
              }, fail);
            }, fail);
          }

          function onCopySuccess(entry) {
            $rootScope.imageFileEntry = entry;
            GlobalService.showLoading();
            if(loginResponse.type === 'ADMIN' || loginResponse.type === 'TEACHER'){
              $state.go('app.popupAlbums');
              $rootScope.takePictureBoolean = true;
            }
            else if(loginResponse.type == 'PARENT'){
              $state.go('pApp.popupAlbums');
              $rootScope.takePictureBoolean = true;
            }
          }

          function fail(error) {
            window.alert(JSON.stringify(error));
          }

        };
          
        var cameraError = function (error) {
          console.error('camera error: ', error);
        };
          navigator.camera.getPicture(cameraSuccess, cameraError, options);
        }, false);
      };

      if(loginResponse.type == 'ADMIN' || loginResponse.type === 'TEACHER'){
        getAlbumByOrgId();
      }
      else if(loginResponse.type == 'PARENT'){
        if(getStudentInfo.length > 0){
          getAlbumByStudentId();
        }
      }
    });
