(function (angular) {
  'use strict';

  angular.module('ngGeonames').directive('search', [ '$log', '$timeout', '$http', 'geonamesHelpers', 'geonamesService', function ($log, $timeout, $http, geonamesHelpers, geonamesService) {
    return {
      restrict: "A",
      scope: false,
      replace: false,
      require: [ 'geonames' ],

      link: function (scope, element, attrs, controller) {

        var isDefined = geonamesHelpers.isDefined;
        var isString = geonamesHelpers.isString;

        var geonamesScope = controller[0].getScope();
        var geonamesController = controller[0];
        var errorHeader = '[ng-geonames] ' + ' [Search] ';

        geonamesController.get().then(function (geonames) {

          var lastGeonamesQuery;

          geonamesScope.$watch('search', function (search) {
            if (scope.settingSearchFromGeonames) {
              return;
            }

            if ( isDefined(search.q) && isString(search.q) && search.q !== '' && search.q !== lastGeonamesQuery ) {

              scope.settingSearchFromScope = true;

              scope.$broadcast('geonamesDirectiveSearch.find_start');

              geonamesService.query(search, attrs.id).then(function (data) {
                search.find = data;
                scope.$broadcast('geonamesDirectiveSearch.find_end', data);
              }, function (errMsg) {
                search.find = [];
                scope.$broadcast('geonamesDirectiveSearch.find_end', []);
                $log.error(errorHeader + ' ' + errMsg + '.');
              });

              lastGeonamesQuery = search.q;

              $timeout(function () {
                scope.settingSearchFromScope = false;
              });
              return;
            }

          }, true);
        });
      }
    };
  }]);
}(window.angular));
