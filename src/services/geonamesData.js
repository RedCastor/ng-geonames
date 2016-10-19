(function (angular) {
  'use strict';

  angular.module('ngGeonames').service('geonamesData', [ '$q', '$log', 'geonamesHelpers', function ($q, $log, geonamesHelpers) {
    var getDefer = geonamesHelpers.getDefer,
      getUnresolvedDefer = geonamesHelpers.getUnresolvedDefer,
      setResolvedDefer = geonamesHelpers.setResolvedDefer;

    var _private = {};
    var self = this;

    var upperFirst = function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    var _privateItems = [
      'geonames'
    ];

    //init
    _privateItems.forEach(function(itemName){
      _private[itemName] = {};
    });

    this.unresolveGeonames = function (scopeId) {
      var id = geonamesHelpers.obtainEffectiveGeonamesId(_private.geonames, scopeId);
      _privateItems.forEach(function (itemName) {
        _private[itemName][id] = undefined;
      });
    };

    //int repetitive stuff (get and sets)
    _privateItems.forEach(function (itemName) {
      var name = upperFirst(itemName);
      self['set' + name] = function (lObject, scopeId) {
        var defer = getUnresolvedDefer(_private[itemName], scopeId);
        defer.resolve(lObject);
        setResolvedDefer(_private[itemName], scopeId);
      };

      self['get' + name] = function (scopeId) {
        var defer = getDefer(_private[itemName], scopeId);
        return defer.promise;
      };
    });
  }]);
}(window.angular));