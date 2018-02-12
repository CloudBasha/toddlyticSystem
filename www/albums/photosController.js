'use strict';
angular.module('toddlytics')
  .controller('PhotosCtrl',
    function ($scope, $state, albumsService, $rootScope, $ionicModal, $ionicSlideBoxDelegate, $stateParams,  $cordovaFileTransfer, $timeout, GlobalService, $log, $ionicPopup) {

      var loginResponse = $rootScope.loginResponse;
      $scope.stateParamPhotos = $stateParams.photos;
      $scope.albumId = $stateParams.albumId;
      console.log($scope.albumId);

      if(loginResponse.type === 'ADMIN' || loginResponse.type === 'TEACHER'){
        $scope.photosOfAlbum = albumsService.getPhotosData();
      }
      else if(loginResponse.type == 'PARENT'){
        if($scope.stateParamPhotos != null){
          $scope.photosOfAlbum = $scope.stateParamPhotos;
        }
      }
      $scope.show2Grid = 2;
  
      $ionicModal.fromTemplateUrl('image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.deletePhoto = function(photo, e) {
        e.stopPropagation();
        console.log(photo);
        var api = 'cms/d_photo';
        var obj = {
          photoId: photo.photo.photoId.toString(),
          contactEmail: $rootScope.contactResponse.email
        };
        var myPopup = $ionicPopup.show({
          title: 'Delete Photo',
          subTitle: 'Confirm Delete?',
          scope: $scope,
          buttons: [
            { text: 'Cancel' },
            {
              text: '<b>Confirm</b>',
              type: 'button-positive',
              onTap: function(e) {
                albumsService.deletePhoto(obj, api).then(function(resp){
                console.log(resp);
                $scope.photosOfAlbum.splice($scope.photosOfAlbum.indexOf(photo), 1);
                $scope.closeModal();
              });
                    }
            }
          ]
        });
        
      }

      $scope.downloadPhoto = function(photo, e) {
        e.stopPropagation();
        console.log(photo);
        var name = photo.imageUrl.split('/').pop();
        var imgURL = $rootScope.checkImageUrl(photo.imageUrl);
        var target = cordova.file.externalRootDirectory + 'Toddlytic/' + name;
        var trustHosts = true;
        var options = {};

         $cordovaFileTransfer.download(imgURL, target, options, trustHosts)
           .then(function(result) {
             // Success!
             console.log(result);
               GlobalService.showToast('Your pic was downloaded to your phone. Look for a folder in your phone gallery called Toodlytic', 'long', 'bottom');
             refreshMedia.refresh(target);

           }, function(err) {
             console.log(err);
             // Error
           }, function (progress) {
              $timeout(function () {
                console.log(progress);
                $scope.downloadProgress = (progress.loaded / progress.total) * 100;
              });
           });
      }

      $scope.openModal = function () {
        $ionicSlideBoxDelegate.slide(0);
        $scope.modal.show();
      };

      $scope.closeModal = function () {
        $scope.modal.hide();
      };

      $scope.showImage = function (index) {
        $scope.modal.show();
        $ionicSlideBoxDelegate.slide(index);
        $scope.currentPhoto = $scope.photosOfAlbum[index];
      };

      $scope.goToSlide = function (index) {
        $scope.modal.show();
        $ionicSlideBoxDelegate.slide(index);
      };

      // Called each time the slide changes
      $scope.slideChanged = function (index) {
        $scope.slideIndex = index;
        $scope.currentPhoto = $scope.photosOfAlbum[index];
      };

      $rootScope.changePhotosGrid = function () {
        if ($scope.show2Grid == 2) {
          $scope.show2Grid = 4;
        }
        else {
          $scope.show2Grid = 2;
        }
      }
    });
