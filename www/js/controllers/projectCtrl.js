angular.module('starter').controller('ProjectCtrl', ['$scope', '$state', '$stateParams', 'ProjectsService', '$ionicModal', '$ionicPopup',
    '$cordovaGeolocation', 'leafletData', 'ConfigService', 'leafletMarkerEvents', '$ionicPlatform', '$ionicHistory',

    function($scope, $state, $stateParams, ProjectsService, $ionicModal, $ionicPopup,
        $cordovaGeolocation, leafletData, ConfigService, leafletMarkerEvents, $ionicPlatform, $ionicHistory) {



        $scope.name = $stateParams.identifier;
        $scope.online = $stateParams.online;
        $scope.project = {};
        $scope.dicAtt;
        $scope.dicValues;
        var attributes = [];
        $scope.markers = {};
        $scope.currentProperties = {};
        $scope.impactTypes;
        $scope.inverseDicAtt;
        var templateNewProps = {};
        var geojsonProject;
        var dicIndicators = {};
        var inverseIndicators = {};
        var modalShown = false;


        /**
         * Default params of the map
         * @type {Object}
         */
        $scope.defaults = {
            tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            //maxZoom: 18,
            zoomControlPosition: 'bottomright'
        };

        /**
         * Options for the geojson to display
         * @type {Object}
         */
        $scope.geojson = {
            style: {
                fillColor: "red",
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            }
        };

        $scope.center = {
            lat: 40.095,
            lng: -3.823,
            zoom: 4
        };

        /**
         * events to catch
         * @type {Object}
         */
        $scope.events = {
            map: {
                enable: ['click', 'contextmenu'],
                logic: 'emit'
            },
            marker: {
                enable: ['click', 'contextmenu'],
                logic: 'emit'
            }
        };

        /**
         * Checks length of dicAtt dictionary, to see if there are posible values for the attribute or not.
         * @param  {[type]} key [property to search inside dicAtt]
         * @return {[type]}     [length of array in dicAtt, 0 if not exists the given key]
         */
        $scope.checkLength = function(key) {
            var trasnKey = "_";
            for (var prop in $scope.dicAtt) {
                if ($scope.dicAtt.hasOwnProperty(prop)) {
                    if ($scope.dicAtt[prop] === key) trasnKey = prop;
                }
            }
            var aux = trasnKey.split("_");
            var id = aux[2];
            $scope.currentID = id;
            if ($scope.dicValues.hasOwnProperty(id)) {
                return Object.keys($scope.dicValues[id]).length;
            } else return 0;
        }


        /**
         * Handle hardware back button to ensure good navigation
         * @param  {[type]} event) {                       event.preventDefault();            event.stopPropagation();            if (modalShown [description]
         * @return {[type]}        [description]
         */
        $ionicPlatform.onHardwareBackButton(function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (modalShown === true) {
                modalShown = false;
            } else if ($ionicHistory.backView().stateName === "app.newProject" && modalShown === false) {
                $ionicHistory.goBack(-2);
            }
        });

        /**
         * [findTranslate description]
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        var findTranslate = function(key) {
            for (var keyDict in $scope.dicAtt) {
                if ($scope.dicAtt.hasOwnProperty(keyDict)) {
                    if ($scope.dicAtt[keyDict] === key) return keyDict;
                }
            }
        }


        /**
         * Translates the current properties of the feature to RC_XX/RD_XX form.
         * @return {[type]} [description]
         */
        var translateTorc = function() {
            for (var i in $scope.currentProperties) {
                if ($scope.currentProperties.hasOwnProperty(i)) {
                    //if i is of the type _rc_XX//_rd_XX, otherwise it's and indicator.
                    if (i.indexOf("_") > -1) {
                        var str = $scope.inverseDicAtt[i].split("_");
                        var id = str[2];
                        var value = $scope.currentProperties[i];
                        if ($scope.dicValues.hasOwnProperty(id)) {
                            for (var key in $scope.dicValues[id]) {
                                if ($scope.dicValues[id][key] === value) value = key;
                            }
                        }
                        $scope.currentFeature.properties[$scope.inverseDicAtt[i]] = value;
                        if ($scope.currentFeature.properties.hasOwnProperty("_rd_" + id)) {
                            $scope.currentFeature.properties["_rd_" + id] = $scope.currentProperties[i];
                        }
                    }
                }
            }
        }

        /**
         * Updates current edited polygon by translating it to _RC_XX/_RD_XX form an updating the currentFeature
         * 
         */
        $scope.updateCurrentPolygon = function() {
            translateTorc();
            geojsonProject.features[$scope.currentFeature.id] = $scope.currentFeature;
        }

        /**
         * Find a property in the dictionary a returns its value (new key for the property)
         * @param  {[type]} id         key value of the property (_rc_XX, _rd_YY)
         * @param  {[type]} value      Value of the id
         * @param  {[type]} dictionary Dictionary used for translating (currently retrieved from scope)
         * @return {[type]}            Reurns the property translated
         */
        var translateProperty = function(id, value, dictionary) {
            var newValue;
            if (value === "" || value === "Undefined") {
                newValue = null;
            } else {
                if ($scope.dicValues.hasOwnProperty(id)) {
                    if ($scope.dicValues[id].hasOwnProperty(value)) {
                        newValue = $scope.dicValues[id][value];
                    } else {
                        newValue = value;
                    }
                } else {
                    newValue = value;
                }
            }
            return newValue;
        }


        /**
         * Translate a Hash of properties from a feature using the dictionaries generated from ConfigService
         * @param  Object props Hash with all the properties from the layer (key = _rc_XX)
         * @return Object       The properties translated with key = "build_use"
         */
        var translateProperties = function(feature, dictionary) {
            var newProperties = {};
            for (var property in feature.properties) {
                if (feature.properties.hasOwnProperty(property)) {
                    if (property.indexOf("_rc_") > -1) {
                        var aux = property.split("_");
                        var id = aux[2];
                        newProperties[$scope.dicAtt['_rc_' + id]] = translateProperty(id, feature.properties[property]);
                    }
                    if (property.indexOf("indicat") > -1) {
                        var indicatorID = property.replace( /^\D+/g, '');
                        if (!isNaN(indicatorID) && indicatorID > 0 && dicIndicators.hasOwnProperty(indicatorID)) {
                            newProperties[dicIndicators[indicatorID].name] = feature.properties[property];
                        }
                    }
                }
            }
            return newProperties;
        }

        /**
         * Updates the current feature and current properties depending on where the user clicked on the map
         * @param  {[type]} ev              [event displayed]
         * @param  {[type]} leafletPayload  [returned property for the event]
         */
        $scope.$on("leafletDirectiveGeoJson.click", function(ev, leafletPayload) {
            $scope.currentFeature = geojsonProject.features[leafletPayload.leafletObject.feature.id];
            $scope.currentProperties = translateProperties($scope.currentFeature);
            $ionicModal.fromTemplateUrl('templates/polygonDetail.html', {
                scope: $scope
            }).then(function(modal) {
                modalShown = true;
                $scope.modalInfo = modal;
                $scope.modalInfo.show();
            });
        });

        /**
         * [description]
         * @param  {[type]} event [description]
         * @param  {[type]} args) {  var leafEvent [description]
         * @return {[type]}       [description]
         */
        $scope.$on('leafletDirectiveMap.contextmenu', function(event, args) {
            //Enable events if it is a new or point layer
            if (geojsonProject.features.length === 0 || geojsonProject.features[0].geometry.type === "Point") {
                var leafEvent = args.leafletEvent;
                $scope.eventDetected = "contextmenu";
                var point = turf.point([leafEvent.latlng.lng, leafEvent.latlng.lat]);
                point.id = geojsonProject.features.length;
                point.properties = angular.copy(templateNewProps);
                geojsonProject.features.push(point);
                $scope.markers[point.id] = {};
                $scope.markers[point.id].lat = point.geometry.coordinates[1];
                $scope.markers[point.id].lng = point.geometry.coordinates[0];
                $scope.markers[point.id].focus = true;
            }
        });



        /**
         * Marker click event, gets the feature corresponding to the marker ID. and shows the properties.
         */
        $scope.$on('leafletDirectiveMarker.click', function(event, args) {
            $scope.currentFeature = geojsonProject.features[args.modelName];
            $scope.currentProperties = translateProperties($scope.currentFeature);
            $ionicModal.fromTemplateUrl('templates/polygonDetail.html', {
                scope: $scope
            }).then(function(modal) {
                modalShown = true;
                $scope.modalInfo = modal;
                $scope.modalInfo.show();
            });
        })

        var successSave = function(response) {
            ProjectsService.updateLocalProjects();
        }

        var errorSave = function(err) {
            //toast
        }

        /**
         * Save project to local
         */
        $scope.saveToLocal = function() {
            var savePromise = ProjectsService.saveToLocalProjects(geojsonProject);
            savePromise.then(successSave, errorSave);
        }

        /**
         * Translates shapfile to geojson and displays the layer on the map, also get needed values as dicAtt,
         * dicValues and inverseDicAtt to make the conversion of layer properties.
         * @param  {[type]} response [zip response]
         */
        var successZipCallback = function(response) {
            shp(response).then(function(geojson) {
                console.log("geojson", geojson);
                $scope.project = geojson;
                for (var i = 0; i < geojson.features.length; ++i) {
                    geojson.features[i].id = i;
                }
                templateNewProps = angular.copy(geojson.features[0].properties);
                for (var i in templateNewProps) {
                    if (templateNewProps.hasOwnProperty(i)) {
                        templateNewProps[i] = "";
                    }
                }
                geojsonProject = angular.copy(geojson);
                for (var i = 0; i < geojson.features.length; ++i) {
                    geojson.features[i].properties = {};
                }
                var centerPt = turf.center(geojson);
                $scope.$apply(function() {
                    $scope.center.zoom = 15;
                    $scope.center.lng = centerPt.geometry.coordinates[0];
                    $scope.center.lat = centerPt.geometry.coordinates[1];
                    $scope.geojson.data = geojson;
                })
                $scope.dicAtt = ConfigService.getAttributes();
                $scope.dicValues = ConfigService.getDicValues();
                $scope.inverseDicAtt = ConfigService.getInverseDicAtrc();
                dicIndicators = ConfigService.getIndicators();
                inverseIndicators = ConfigService.getInverseIndicators();
            });
        }


        var errorZipCallback = function(err) {
            console.log("ups :(");
        }

        /**
         * Locates the user in the current position of the map.
         * @return {[type]} [description]
         */
        $scope.locate = function() {
            $cordovaGeolocation
                .getCurrentPosition()
                .then(function(position) {
                    $scope.center.lat = position.coords.latitude;
                    $scope.center.lng = position.coords.longitude;
                    /*$scope.markers.push({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        message: "You Are Here",
                        focus: true,
                        draggable: true
                    });*/

                }, function(err) {
                    // error
                    console.log("Location error!");
                    console.log(err);
                });

        }


        /**
         * enable properties for a new layer.
         * @param  {[type]} idCat [ID of the project category]
         */
        var computeNewProps = function(idCat) {
            var att = ConfigService.getAttributesArray();
            var size = att.length;
            for (var i = 0; i < size; ++i) {
                if (idCat === att[i].category) {
                    templateNewProps[$scope.inverseDicAtt[att[i].name]] = "";
                }
            }
        }

        /**
         * 
         * @param  {[type]} response [response from query to local directory]
         * Display geojson on the map
         */
        var displayLayer = function(response) {
            var geojson = JSON.parse(response);
            $scope.project = geojson;
            $scope.dicAtt = ConfigService.getAttributes();
            $scope.dicValues = ConfigService.getDicValues();
            $scope.inverseDicAtt = ConfigService.getInverseDicAtrc();
            dicIndicators = ConfigService.getIndicators();
            inverseIndicators = ConfigService.getInverseIndicators();
            for (var i = 0; i < geojson.features.length; ++i) {
                geojson.features[i].id = i;
            }
            if (geojson.features.length === 0) {
                computeNewProps(geojson.metadata.category.id);
                $scope.locate();
            } else {
                templateNewProps = angular.copy(geojson.features[0].properties);
                for (var i in templateNewProps) {
                    if (templateNewProps.hasOwnProperty(i)) {
                        templateNewProps[i] = "";
                    }
                }
            }
            geojsonProject = angular.copy(geojson);
            for (var i = 0; i < geojson.features.length; ++i) {
                geojson.features[i].properties = {};
            }
            var centerPt = turf.center(geojson);
            $scope.center.zoom = 15;
            $scope.center.lng = centerPt.geometry.coordinates[0];
            $scope.center.lat = centerPt.geometry.coordinates[1];
            $scope.geojson.data = geojson;

        }

        /**
         * Initialization function, depending if the layer is online, or is a local layer, the function
         * will call different functions and will make different queries
         */
        var init = function() {
            if ($scope.online === true) {
                $scope.project = ProjectsService.getOnlineProject($scope.name);
                if ($scope.project === undefined) {
                    $state.go("app.projects?typeLayer=exposure");
                } else {
                    var deturl = $scope.project.detail_url;
                    var arr = deturl.split("/geonode%3A");
                    var layerName = arr[arr.length - 1];
                    var downloadZipPromise = ProjectsService.downloadZip(layerName);
                    downloadZipPromise.success(successZipCallback).error(errorZipCallback);
                }
            } else {
                var getLocalProjectPromise = ProjectsService.getLocalProject($scope.name);
                getLocalProjectPromise.then(displayLayer);
            }

        }

        /**
         * Modal showing owner, date and title of the layer.
         * @return {[type]} [description]
         */
        $scope.showLayerInfo = function() {
            $ionicModal.fromTemplateUrl('templates/infoLayer.html', {
                scope: $scope
            }).then(function(modal) {
                modalShown = true;
                $scope.modalInfo = modal;
                $scope.modalInfo.show();
            });
        }

        $scope.closeInfoLayerModal = function() {
            modalShown = false;
            $scope.modalInfo.hide();

        }
        init();
    }
]);
