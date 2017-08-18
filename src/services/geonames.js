(function (angular) {
  'use strict';

  angular.module('ngGeonames').factory('geonamesService', [ '$log', '$sce', '$q', '$http', 'geonamesHelpers', 'geonamesDefaults', function ($log, $sce, $q, $http, geonamesHelpers, geonamesDefaults) {
    var isDefined = geonamesHelpers.isDefined;
    var isString = angular.isString;
    var egal = geonamesHelpers.equals;

    return {
      query: function(query, geonamesId) {
        var defaults = geonamesDefaults.getDefaults(geonamesId);
        var url = defaults.server;
        var max_rows = defaults.maxRows;
        var postal_code = defaults.postalCode;
        var country = defaults.country;
        var username = defaults.username;
        var df = $q.defer();
        var find = [];
        var find_key = null;

        var http_query = {
          method: 'JSONP',
          url: url,
          params: {},
          cancellable: true
        } ;

        //Set query params
        if(isDefined(query.q) && isString(query.q) && query.q !== '') {
          if( postal_code === true ) {
            http_query.url += '/postalCodeLookupJSON';
            http_query.params.postalcode = query.q;
            find_key = 'postalcodes';
          }
          else {
            http_query.url += '/searchJSON';
            http_query.params.q = query.q;
            find_key = 'geonames';
          }

          if( isDefined(query.country) && isString(query.country) && query.country !== ''  ) {
            country = query.country;
          }
        }

        if ( isDefined(http_query.params) && !egal({}, http_query.params) ) {
          angular.extend(http_query.params, {
            maxRows: max_rows,
            country: country,
            username: username,
            jsonpCallbackParam: 'callback'
          });

          //Trusted url resource
          http_query.url = $sce.trustAsResourceUrl(http_query.url);

          $http(http_query).then(
            function(response_success) {
              if (isDefined(response_success.data[find_key])) {
                angular.forEach(response_success.data[find_key], function (item, key_item) {
                  switch (find_key) {
                    case 'postalcodes':
                      if (!isDefined(item.title)){
                        item.title = '[' + item.postalcode + '] ';
                      }
                      if (!isDefined(item.locationName)){
                        item.locationName = item.countryCode + ' ' + item.placeName;
                      }
                      break;
                    case 'geonames':
                      if (!isDefined(item.title)){
                        item.title = item.name;
                      }
                      if (!isDefined(item.locationName)){
                        item.locationName = item.countryName;
                      }
                      break;
                  }

                  this.push(item);
                }, find);


                df.resolve(find);
              } else {
                df.reject('[Geonames] Invalid query: ' + response_success.data.status + ' ' + response_success.data.statusText);
                $log.warn(response_success);
              }
            },
            function (response_error) {
                df.reject('[Geonames] Request: ' +  ((response_error.data.status + ' ' + response_error.data.statusText) || 'failed'));
                $log.warn(response_error);
            }
          );
        }
        else {
          df.reject('[Geonames] Invalid query params');
          $log.warn(http_query);
        }

        return df.promise;
      }
    };
  }]);
}(window.angular));
