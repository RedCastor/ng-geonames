(function (angular) {
  'use strict';

  angular.module('ngGeonames').directive('geonames', [ '$q', 'geonamesData', 'geonamesDefaults', 'geonamesHelpers', function ($q, geonamesData, geonamesDefaults, geonamesHelpers) {
    return {
      restrict: "AE",
      replace: false,
      scope: {
        defaults      : '=',
        search         : '=',
        id             : '@'
      },
      transclude: true,
      template: '<div class="angular-geonames"><div ng-transclude></div></div>',
      controller: function ($scope) {
        this._geonames = $q.defer();
        this.getGeonames = function () {
          return this._geonames.promise;
        };

        this.getScope = function() {
          return $scope;
        };
      },

      link: function(scope, element, attrs, ctrl) {
        var isDefined = geonamesData.isDefined;
        var defaults  = geonamesDefaults.setDefaults(scope.defaults, attrs.id);

        scope.geonamesId =  attrs.id;

        // Create the Geonames Object with the options
        var geonames = geonamesDefaults.getGeonamesCreationDefaults(attrs.id);
        ctrl._geonames.resolve(geonames);


        // Resolve the geonames object to the promises
        geonamesData.setGeonames(geonames, attrs.id);


        scope.$on('$destroy', function () {
          geonamesDefaults.reset(attrs.id);
          geonamesData.unresolveGeonames(attrs.id);
        });
      }
    };
  }]);
}(window.angular));