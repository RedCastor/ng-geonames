(function(angular) {
    "use strict";
    angular.module("ngGeonames", []).service("geonamesHelpers", [ "$q", "$log", "$timeout", function($q, $log, $timeout) {
        var _errorHeader = "[ng-geonames] ";
        var _isString = function(value) {
            return angular.isString(value) && value !== "";
        };
        var _isDefined = function(value) {
            return angular.isDefined(value) && value !== null;
        };
        var _isUndefined = function(value) {
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
            var id = _obtainEffectiveGeonamesId(d, geonamesId), defer;
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
            isTruthy: function(val) {
                return val === "true" || val === true;
            },
            isEmpty: function(value) {
                return Object.keys(value).length === 0;
            },
            isUndefinedOrEmpty: function(value) {
                return angular.isUndefined(value) || value === null || Object.keys(value).length === 0;
            },
            isDefined: _isDefined,
            isUndefined: _isUndefined,
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
    } ]);
})(window.angular);

(function(angular) {
    "use strict";
    angular.module("ngGeonames").factory("geonamesDefaults", [ "$q", "geonamesHelpers", function($q, geonamesHelpers) {
        function _getDefaults() {
            return {
                server: "http://api.geonames.org",
                maxRows: 50,
                postalCode: false,
                country: [],
                username: "demo"
            };
        }
        var isDefined = geonamesHelpers.isDefined, isObject = geonamesHelpers.isObject, obtainEffectiveGeonamesId = geonamesHelpers.obtainEffectiveGeonamesId, defaults = {};
        return {
            reset: function() {
                defaults = {};
            },
            getDefaults: function(scopeId) {
                var geonamesId = obtainEffectiveGeonamesId(defaults, scopeId);
                return defaults[geonamesId];
            },
            getGeonamesCreationDefaults: function(scopeId) {
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
            setDefaults: function(userDefaults, scopeId) {
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
    } ]);
})(window.angular);

(function(angular) {
    "use strict";
    angular.module("ngGeonames").service("geonamesData", [ "$q", "$log", "geonamesHelpers", function($q, $log, geonamesHelpers) {
        var getDefer = geonamesHelpers.getDefer, getUnresolvedDefer = geonamesHelpers.getUnresolvedDefer, setResolvedDefer = geonamesHelpers.setResolvedDefer;
        var _private = {};
        var self = this;
        var upperFirst = function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        var _privateItems = [ "geonames" ];
        _privateItems.forEach(function(itemName) {
            _private[itemName] = {};
        });
        this.unresolveGeonames = function(scopeId) {
            var id = geonamesHelpers.obtainEffectiveGeonamesId(_private.geonames, scopeId);
            _privateItems.forEach(function(itemName) {
                _private[itemName][id] = undefined;
            });
        };
        _privateItems.forEach(function(itemName) {
            var name = upperFirst(itemName);
            self["set" + name] = function(lObject, scopeId) {
                var defer = getUnresolvedDefer(_private[itemName], scopeId);
                defer.resolve(lObject);
                setResolvedDefer(_private[itemName], scopeId);
            };
            self["get" + name] = function(scopeId) {
                var defer = getDefer(_private[itemName], scopeId);
                return defer.promise;
            };
        });
    } ]);
})(window.angular);

(function(angular) {
    "use strict";
    angular.module("ngGeonames").factory("geonamesService", [ "$log", "$q", "$http", "geonamesHelpers", "geonamesDefaults", function($log, $q, $http, geonamesHelpers, geonamesDefaults) {
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
                    method: "JSONP",
                    url: url,
                    params: {},
                    cancellable: true
                };
                if (isDefined(query.q) && isString(query.q) && query.q !== "") {
                    if (postal_code === true) {
                        http_query.url += "/postalCodeLookupJSON";
                        http_query.params.postalcode = query.q;
                        find_key = "postalcodes";
                    } else {
                        http_query.url += "/searchJSON";
                        http_query.params.q = query.q;
                        find_key = "geonames";
                    }
                    if (isDefined(query.country) && isString(query.country) && query.country !== "") {
                        country = query.country;
                    }
                }
                if (isDefined(http_query.params) && !egal({}, http_query.params)) {
                    angular.extend(http_query.params, {
                        maxRows: max_rows,
                        country: country,
                        username: username,
                        callback: "JSON_CALLBACK"
                    });
                    $http(http_query).success(function(data) {
                        if (isDefined(data[find_key])) {
                            angular.forEach(data[find_key], function(item, key_item) {
                                switch (find_key) {
                                  case "postalcodes":
                                    if (!isDefined(item.title)) {
                                        item.title = "[" + item.postalcode + "] ";
                                    }
                                    if (!isDefined(item.locationName)) {
                                        item.locationName = item.countryCode + " " + item.placeName;
                                    }
                                    break;

                                  case "geonames":
                                    if (!isDefined(item.title)) {
                                        item.title = item.name;
                                    }
                                    if (!isDefined(item.locationName)) {
                                        item.locationName = item.countryName;
                                    }
                                    break;
                                }
                                this.push(item);
                            }, find);
                            df.resolve(find);
                        } else {
                            df.reject("[Geonames] Invalid query: " + data.status.message);
                        }
                    });
                } else {
                    df.reject("[Geonames] Invalid query params");
                    $log.error(http_query);
                }
                return df.promise;
            }
        };
    } ]);
})(window.angular);

(function(angular) {
    "use strict";
    angular.module("ngGeonames").directive("geonames", [ "$q", "geonamesData", "geonamesDefaults", "geonamesHelpers", function($q, geonamesData, geonamesDefaults, geonamesHelpers) {
        return {
            restrict: "AE",
            replace: false,
            scope: {
                defaults: "=",
                search: "=",
                id: "@"
            },
            transclude: true,
            template: '<div class="angular-geonames"><div ng-transclude></div></div>',
            controller: [ "$scope", function($scope) {
                this._geonames = $q.defer();
                this.get = function() {
                    return this._geonames.promise;
                };
                this.getScope = function() {
                    return $scope;
                };
            } ],
            link: function(scope, element, attrs, ctrl) {
                var isDefined = geonamesData.isDefined;
                var defaults = geonamesDefaults.setDefaults(scope.defaults, attrs.id);
                scope.geonamesId = attrs.id;
                var geonames = geonamesDefaults.getGeonamesCreationDefaults(attrs.id);
                ctrl._geonames.resolve(geonames);
                geonamesData.setGeonames(geonames, attrs.id);
                scope.$on("$destroy", function() {
                    geonamesDefaults.reset();
                    geonamesData.unresolveGeonames(attrs.id);
                });
            }
        };
    } ]);
})(window.angular);

(function(angular) {
    "use strict";
    angular.module("ngGeonames").directive("search", [ "$log", "$timeout", "$http", "geonamesHelpers", "geonamesService", function($log, $timeout, $http, geonamesHelpers, geonamesService) {
        return {
            restrict: "A",
            scope: false,
            replace: false,
            require: [ "geonames" ],
            link: function(scope, element, attrs, controller) {
                var isDefined = geonamesHelpers.isDefined;
                var isString = geonamesHelpers.isString;
                var geonamesScope = controller[0].getScope();
                var geonamesController = controller[0];
                var errorHeader = "[ng-geonames] " + " [Search] ";
                geonamesController.get().then(function(geonames) {
                    var lastGeonamesQuery;
                    geonamesScope.$watch("search", function(search) {
                        if (scope.settingSearchFromGeonames) {
                            return;
                        }
                        if (isDefined(search.q) && isString(search.q) && search.q !== "" && search.q !== lastGeonamesQuery) {
                            scope.settingSearchFromScope = true;
                            scope.$broadcast("geonamesDirectiveSearch.find_start");
                            geonamesService.query(search, attrs.id).then(function(data) {
                                search.find = data;
                                scope.$broadcast("geonamesDirectiveSearch.find_end", data);
                            }, function(errMsg) {
                                search.find = [];
                                scope.$broadcast("geonamesDirectiveSearch.find_end", []);
                                $log.error(errorHeader + " " + errMsg + ".");
                            });
                            lastGeonamesQuery = search.q;
                            $timeout(function() {
                                scope.settingSearchFromScope = false;
                            });
                            return;
                        }
                    }, true);
                });
            }
        };
    } ]);
})(window.angular);
//# sourceMappingURL=ng-geonames.js.map
