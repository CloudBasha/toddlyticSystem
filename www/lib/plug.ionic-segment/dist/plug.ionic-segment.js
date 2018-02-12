angular.module('plug.ionic-segment', [])
.directive('ionSegment', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    transclude: true,
    replace: true,
    scope: {
      full: '@full',
      ngModel: '='
    },
    template: '<ul id="ion-segment" ng-transclude></ul>',
    link: function ($scope, $element, $attr, ngModelCtrl) {
      if ($scope.full == 'true') {
        $element.find('li').addClass('full');
      }
      angular.forEach($element.find('li'), function(element) {
        var segment = angular.element(element);
        if ( segment.attr('value') == $scope.ngModel ) {
          segment.addClass('active');
        }
      });
    }
  }
})
.directive('ionSegmentButton', function () {
  return {
    restrict: 'E',
    require: '^ngModel',
    transclude: true,
    replace: true,
    template: '<li ng-transclude></li>',
    link: function ($scope, $element, $attr, ngModelCtrl) {
      var clickingCallback = function () {
        $element.parent().find('li').removeClass('active');
        $element.addClass('active');
        var segment = $element.attr('value');
        ngModelCtrl.$setViewValue(segment);
      }

      $element.bind('click', clickingCallback);
    }
  }
});

