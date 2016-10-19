(function (angular) {
  'use strict';

  angular.module('ngGeonames').service('geonamesHelpers', [ '$q', '$log', '$timeout', function ($q, $log, $timeout) {

    var _errorHeader = '[ng-geonames] ';

    var _isString = function(value) {
      return angular.isString(value) && value !== '';
    };
    var _isDefined = function(value) {
      return angular.isDefined(value) && value !== null;
    };
    var _isUndefined = function(value){
      return !_isDefined(value);
    };

    function _obtainEffectiveGeonamesId(d, geonamesId) {
      var id, i;
      if (!angular.isDefined(geonamesId)) {
        if (Object.keys(d).length === 0) {
          id = "main";
        } else if (Object.keys(d).length >= 1) {
          for (i in d) {
            if (d.hasOwnProperty(i)) {
              id = i;
            }
          }
        } else {
          $log.error(_errorHeader + "- You have more than 1 geonames on the DOM, you must provide the geonames ID to the geonamesData.getXXX call");
        }
      } else {
        id = geonamesId;
      }

      return id;
    }

    function _getUnresolvedDefer(d, geonamesId) {
      var id = _obtainEffectiveGeonamesId(d, geonamesId),
        defer;

      if (!angular.isDefined(d[id]) || d[id].resolvedDefer === true) {
        defer = $q.defer();
        d[id] = {
          defer: defer,
          resolvedDefer: false
        };
      } else {
        defer = d[id].defer;
      }

      return defer;
    }


    return {
      //mainly for checking attributes of directives lets keep this minimal (on what we accept)
      isTruthy: function(val){
        return val === 'true' || val === true;
      },
      //Determine if a reference is {}
      isEmpty: function(value) {
        return Object.keys(value).length === 0;
      },

      //Determine if a reference is undefined or {}
      isUndefinedOrEmpty: function (value) {
        return (angular.isUndefined(value) || value === null) || Object.keys(value).length === 0;
      },

      // Determine if a reference is defined
      isDefined: _isDefined,
      isUndefined:_isUndefined,
      isNumber: angular.isNumber,
      isString: _isString,
      isArray: angular.isArray,
      isObject: angular.isObject,
      isFunction: angular.isFunction,
      equals: angular.equals,

      getUnresolvedDefer: _getUnresolvedDefer,

      setResolvedDefer: function(d, geonamesId) {
        var id = _obtainEffectiveGeonamesId(d, geonamesId);
        d[id].resolvedDefer = true;
      },

      obtainEffectiveGeonamesId: _obtainEffectiveGeonamesId
    };
  }]);
}(window.angular));