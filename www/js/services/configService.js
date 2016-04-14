angular.module('starter').factory('ConfigService', ['$http', '$cordovaFileTransfer', '$ionicPopup', '$rootScope', '$cordovaFile',

    function($http, $cordovaFileTransfer, $ionicPopup, $rootScope, $cordovaFile) {
        var server = 'http://130.251.104.198/';
        //server = 'http://localhost:1337/130.251.104.198/';


        var projects = [];
        var types = [];
        var hazards = [];
        var categories = [];
        var attributes = [];
        var valuesdecode = [];
        var indicators = [];
        var dicAtRc = {};
        var dicValues = {};
        var inverseDicAtt = {};
        var impactTypes = {};
        var dicIndicators = {};
        var inverseIndicators = {};

        var computeValuesdeCode = function() {
            var idxAttributes = attributes.length;
            var idxValues = valuesdecode.length;
            for (i = 0; i < idxAttributes; ++i) {
                for (j = 0; j < idxValues; ++j) {
                    if (valuesdecode[j].attribute === attributes[i].id) {
                        if (dicValues[attributes[i].id] === undefined) {
                            dicValues[attributes[i].id] = {};
                        }
                        var obj = {};
                        dicValues[attributes[i].id][valuesdecode[j].id] = valuesdecode[j].name;
                    }
                }
            }
        }

        var createDictoinariIndicators = function() {
            var size = indicators.length;
            for (var i = 0; i < size; ++i) {
                dicIndicators[indicators[i].id] = indicators[i];
                inverseIndicators[indicators[i]] = indicators[i].id;
            }
        }

        var translateRc = function() {
            var idx = attributes.length;
            for (i = 0; i < idx; ++i) {
                dicAtRc['_rc_' + attributes[i].id] = attributes[i].name;
                inverseDicAtt[attributes[i].name] = '_rc_' + attributes[i].id;
            }
        }

        var loadCategories = function() {
            $http.get(server + "rasorapi/db/exposure/categories/").then(function(response) {
                $cordovaFile.writeFile(cordova.file.dataDirectory + 'resources', "categories.json", response.data.objects, true);
                categories = response.data.objects;
            });
        }

        var loadHazards = function() {
            $http.get(server + "rasorapi/db/hazard/hazards/").then(function(response) {
                $cordovaFile.writeFile(cordova.file.dataDirectory + 'resources', "hazards.json", response.data.objects, true);
                hazards = response.data.objects;
            });
        }

        var loadAttributes = function() {
            $http.get(server + "rasorapi/db/exposure/attributes/").then(function(response) {
                $cordovaFile.writeFile(cordova.file.dataDirectory + 'resources', "attributes.json", response.data.objects, true);
                attributes = response.data.objects;
                translateRc();
            });
        }
        var loadValuesDecode = function() {
            $http.get(server + "rasorapi/db/exposure/valuesdecode/").then(function(response) {
                $cordovaFile.writeFile(cordova.file.dataDirectory + 'resources', "valuesdecode.json", response.data.objects, true);
                valuesdecode = response.data.objects;
                computeValuesdeCode();

            });
        }

        var loadIndicators = function() {
            $http.get(server + "rasorapi/db/impact/indicators/").then(function(response) {
                $cordovaFile.writeFile(cordova.file.dataDirectory + 'resources', "indicators.json", response.data.objects, true);
                indicators = response.data.objects;
                createDictoinariIndicators();

            });
        }

        var loadImpactTypes = function() {
            $http.get(server + "rasorapi/db/impact/types").then(function(response) {
                $cordovaFile.writeFile(cordova.file.dataDirectory + 'resources', "impactTypes.json", response.data.objects, true);
                impactTypes = response.data.objects;

            });
        }

        var loadResources = function() {
            loadCategories();
            loadHazards();
            loadAttributes();
            loadValuesDecode();
            loadIndicators();
            loadImpactTypes();
        }

        var createDirs = function() {
            //CREATE LOCAL PROJECTS DIR
            $cordovaFile.createDir(cordova.file.dataDirectory, 'localprojects', false).then(function(success) {
                // success
            }, function(error) {
                // error
            });
            //CREATING RESOURCES DIRECTORY
            $cordovaFile.createDir(cordova.file.dataDirectory, 'resources', true).then(loadResources);
        }
        var loadConfig = function() {
            createDirs();
        };

        $rootScope.$on("cordovaReady", loadConfig);

        return {
            getTypes: function() {
                return types;
            },
            getCategories: function() {
                return categories;
            },
            getHazards: function() {
                return hazards;
            },
            getAttributesArray: function() {
                return attributes;
            },
            getValuesdecode: function() {
                return values;
            },
            getIndicators: function() {
                return dicIndicators;

            },
            getAttributes: function() {
                return dicAtRc;
            },
            getDicValues: function() {
                return dicValues;
            },
            getInverseDicAtrc: function() {
                return inverseDicAtt;
            },
            getInverseIndicators: function() {
                return inverseIndicators;
            },
            getImpactTypes: function() {
                return impactTypes;
            }


        }
    }
]);
