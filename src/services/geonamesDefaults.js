(function (angular) {
  'use strict';

  angular.module('ngGeonames').factory('geonamesDefaults', [ '$q', 'geonamesHelpers', function ($q, geonamesHelpers) {

    function _getDefaults() {
      return {
          server: 'http://api.geonames.org',
          maxRows: 50,
          postalCode: false,
          country: [],
          username: 'demo'
      };
    }

    var isDefined = geonamesHelpers.isDefined,
      isObject = geonamesHelpers.isObject,
      obtainEffectiveGeonamesId = geonamesHelpers.obtainEffectiveGeonamesId,
      defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
      reset: function (scopeId) {
        var geonamesId = obtainEffectiveGeonamesId(defaults, scopeId);
        if (geonamesId !== 'mainGeonames') {
          delete defaults[geonamesId];
        }
      },
      getDefaults: function (scopeId) {
        var geonamesId = obtainEffectiveGeonamesId(defaults, scopeId);
        return defaults[geonamesId];
      },

      getGeonamesCreationDefaults: function (scopeId) {
        var geonamesId = obtainEffectiveGeonamesId(defaults, scopeId);
        var d = defaults[geonamesId];

        var geonamesDefaults = {
          server: d.server,
          maxRows: d.maxRows,
          postalCode: d.postalCode,
          country: d.country,
          username: d.username
        };


        return geonamesDefaults;
      },

      setDefaults: function (userDefaults, scopeId) {
        var newDefaults = _getDefaults();

        if (isDefined(userDefaults)) {
          newDefaults.server = isDefined(userDefaults.server) ? userDefaults.server : newDefaults.server;
          newDefaults.maxRows = isDefined(userDefaults.maxRows) ? userDefaults.maxRows : newDefaults.maxRows;
          newDefaults.postalCode = isDefined(userDefaults.postalCode) ? userDefaults.postalCode : newDefaults.postalCode;
          newDefaults.country = isDefined(userDefaults.country) ? userDefaults.country : newDefaults.country;
          newDefaults.username = isDefined(userDefaults.username) ? userDefaults.username : newDefaults.username;
        }

        var geonamesId = obtainEffectiveGeonamesId(defaults, scopeId);
        defaults[geonamesId] = newDefaults;
        return newDefaults;
      }
    };
  }]);
}(window.angular));
