'use strict';
angular.module('toddlytics')
  .controller('schoolFinderMainCtrl',
    function ($scope, $state, $http, $timeout, GlobalService, $cordovaGeolocation, $rootScope, $ionicPopup, deviceDetector, $log, API_URL, $ionicPopover, $filter) {

    $scope.processDataWithInternet = function() {
        google.maps.event.addDomListener(document.getElementById("storesMap"), 'load', $scope.initialize());
    };

    $scope.initialize = function() {
        GlobalService.showLoading();
        $scope.map = null;
        var markerClusterer = null;
        var infowindow = new google.maps.InfoWindow();
        var infoWindowContent = [];
        $scope.locations = [];
        var bounds = new google.maps.LatLngBounds();
        var options = { timeout: 5000 };
        navigator.geolocation.getCurrentPosition(onSuccessPos, onErrorPos, options);
        function onSuccessPos(pos) {
            $scope.GPSPointRecorded = true;
            $log.debug("Geolocation Success");
            $scope.myLatitude = pos.coords.latitude;
            $scope.myLongitude = pos.coords.longitude;
            $log.debug("My Latitude",$scope.myLatitude);
            $log.debug("My Longitude",$scope.myLongitude);

            $scope.map = new google.maps.Map(document.getElementById('storesMap'), {
              zoom: 16,
              center: new google.maps.LatLng($scope.myLatitude, $scope.myLongitude),
              mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            var latlng = new google.maps.LatLng($scope.myLatitude, $scope.myLongitude);
            $scope.latlng = latlng;
            $log.debug("My latlng", latlng);

            var request = {
                location: latlng,
                radius: '5000',
                query: 'kindergarten'
            };

            var service = new google.maps.places.PlacesService($scope.map);
            service.textSearch( request, callback );
        }

        function onErrorPos(error){
            $scope.GPSPointRecorded = false;
            GlobalService.hideLoading();
            GlobalService.showToast("Make sure your Location Services are turned on and try again.", 'long', 'bottom');
            $log.debug("Error Working");
            $state.go('pApp.parentLanding');
        }

        function callback(results, status)
        {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                $log.debug("Services Response ", results);
                $scope.originalList = results;
                for (var i = 0; i < results.length; i++) {
//                    $log.debug("My latlng Each", new google.maps.LatLng($scope.myLatitude, $scope.myLongitude));

                    var locationDistance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(results[i].geometry.location.lat(), results[i].geometry.location.lng()), new google.maps.LatLng($scope.myLatitude, $scope.myLongitude));

                    var distanceToLocation = parseFloat(Math.round((locationDistance / 1000) * 10) / 10);
                    results[i].distanceToLocation = distanceToLocation;
                    var place = results[i];
//                    createMarker(results[i]);
                    $scope.locations.push(results[i]);
                }
                $log.debug("Locations ", $scope.locations);
                $scope.sortedPlaces = $scope.locations;
                $scope.locations = $filter('orderBy')($scope.sortedPlaces, 'distanceToLocation');

                $scope.markers = [];
                angular.forEach($scope.locations, function(mapCoords){
                  $log.debug(mapCoords);
                  $scope.storeLat = mapCoords.geometry.location.lat();
                  $scope.storeLong = mapCoords.geometry.location.lng();
                  var position = new google.maps.LatLng($scope.storeLat, $scope.storeLong);

                  var marker = new google.maps.Marker({
                      position: position,
                      map: $scope.map
                  });

                  infoWindowContent = [
                      "<a class='yellowText' href='geo:"+$scope.myLatitude+","+$scope.myLongitude+"?q="+$scope.storeLat+","+$scope.storeLong+"'>" + mapCoords.name,
                      "<br> ",
                      mapCoords.formatted_address + "<br> " + mapCoords.distanceToLocation + "kms" +
                      "</a>"
                  ].join("");

                  google.maps.event.addListener($scope.map, 'click', function(event){
                      infowindow.close();
                  });

                  google.maps.event.addListener(marker, 'click', (function(marker, infoWindowContent) {
                      return function() {
                          infowindow.setContent(infoWindowContent);
                          infowindow.open($scope.map, marker);
                      }
                  })(marker, infoWindowContent));

                  $scope.markers.push(marker);
                });
        //        $ionicLoading.hide();
                $log.debug("Markers ", $scope.markers);

                var zoom = 20;
                var size = 40;

                markerClusterer = new MarkerClusterer($scope.map, $scope.markers, {
                  maxZoom: zoom,
                  gridSize: size,
                  imagePath: 'img/markerClusterer/m'
                });
                $scope.$apply();
                GlobalService.hideLoading();
            }
        }
    }

    $scope.searchNewLocationSchools = function(obj) {
        GlobalService.showLoading();
//        map = new google.maps.Map(document.getElementById('storesMap'));
        var markerClusterer = null;
        var infowindow = new google.maps.InfoWindow();
        var infoWindowContent = [];
        $scope.locations = [];
        var bounds = new google.maps.LatLngBounds();
//        var options = { timeout: 5000 };

            $scope.newLocationLatitude = obj.geometry.location.lat();
            $scope.newLocationlongitude = obj.geometry.location.lng();
            $log.debug("New Latitude",$scope.newLocationLatitude);
            $log.debug("New Longitude",$scope.newLocationlongitude);

            var newLatLng = new google.maps.LatLng($scope.newLocationLatitude, $scope.newLocationlongitude);
            $scope.map.setCenter(newLatLng);
            $scope.latlng = newLatLng;
            $log.debug("New latlng", newLatLng);

            var request = {
                location: newLatLng,
                radius: '1000',
                query: obj.name,
                type : 'school'
            };

            var service = new google.maps.places.PlacesService($scope.map);
            service.textSearch( request, callback );

        function callback(results, status)
        {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                $log.debug("Services Response ", results);
                $scope.originalList = results;
                for (var i = 0; i < results.length; i++) {
//                    $log.debug("My latlng Each", new google.maps.LatLng($scope.myLatitude, $scope.myLongitude));

                    var locationDistance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(results[i].geometry.location.lat(), results[i].geometry.location.lng()), new google.maps.LatLng($scope.myLatitude, $scope.myLongitude));

                    var distanceToLocation = parseFloat(Math.round((locationDistance / 1000) * 10) / 10);
                    results[i].distanceToLocation = distanceToLocation;
                    var place = results[i];
//                    createMarker(results[i]);
                    $scope.locations.push(results[i]);
                }
                $log.debug("Locations ", $scope.locations);
                $scope.sortedPlaces = $scope.locations;

                $scope.markers = [];
                angular.forEach($scope.locations, function(mapCoords){
                  $log.debug(mapCoords);
                  $scope.storeLat = mapCoords.geometry.location.lat();
                  $scope.storeLong = mapCoords.geometry.location.lng();
                  var position = new google.maps.LatLng($scope.storeLat, $scope.storeLong);

                  var marker = new google.maps.Marker({
                      position: position,
                      map: $scope.map
                  });

                  infoWindowContent = [
                      "<a class='yellowText' href='geo:"+$scope.newLocationLatitude+","+$scope.newLocationlongitude+"?q="+$scope.storeLat+","+$scope.storeLong+"'>" + mapCoords.name,
                      "<br> ",
                      mapCoords.formatted_address + "<br> " + mapCoords.distanceToLocation + "kms" +
                      "</a>"
                  ].join("");

                  google.maps.event.addListener($scope.map, 'click', function(event){
                      infowindow.close();
                  });

                  google.maps.event.addListener(marker, 'click', (function(marker, infoWindowContent) {
                      return function() {
                          infowindow.setContent(infoWindowContent);
                          infowindow.open($scope.map, marker);
                      }
                  })(marker, infoWindowContent));

                  $scope.markers.push(marker);
                });
        //        $ionicLoading.hide();
                $log.debug("Markers ", $scope.markers);

                var zoom = 20;
                var size = 40;

                markerClusterer = new MarkerClusterer($scope.map, $scope.markers, {
                  maxZoom: zoom,
                  gridSize: size,
                  imagePath: 'img/markerClusterer/m'
                });
                $scope.$apply();
                GlobalService.hideLoading();
            }
        }
    }

    $ionicPopover.fromTemplateUrl('directives/sortPlaces.html', {
        scope: $scope,
        backdropClickToClose: true,
        animation: 'slide-in-up'
    }).then(function(popover) {
      $scope.popover2 = popover;
    });


    $rootScope.openSortingPopover = function($event) {
      $event.stopPropagation();
      $scope.popover2.show($event);
    };
    $scope.closeSortingPopover = function() {
      $scope.popover2.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover2.remove();
    });
    // Execute action on hidden popover
    $scope.$on('popover2.hidden', function() {
      // Execute action
    });

    $scope.sortPlaces = function(val){
      $scope.sortVal = val;
      if(val == 'name'){
        $scope.locations = $scope.originalList;
        $scope.closeSortingPopover();
      }
      else if(val == 'distance'){
        $scope.locations = $filter('orderBy')($scope.sortedPlaces, 'distanceToLocation');
        $scope.closeSortingPopover();
      }
    }

    $scope.getSchools = function(val){
      $log.debug("Search ", val);
      if(val.name != undefined){
        $scope.searchNewLocationSchools(val);
      }
    }

    $scope.goToSchool = function(place){
      var myLatLng = {
        latitude : $scope.myLatitude,
        longitude : $scope.myLongitude
      }
      if($rootScope.loginResponse.type == 'ADMIN'){
        $state.go('app.schoolFinderSpecific', {obj : place, myCoord : myLatLng})
      }
      else if($rootScope.loginResponse.type == 'PARENT'){
        $state.go('pApp.schoolFinderSpecific', {obj : place, myCoord : myLatLng})
      }
    }

      $scope.processDataWithInternet();

    });
