angular.module('starter').controller('ProjectsCtrl', ['$scope', '$ionicLoading', 'ProjectsService', '$timeout', '$cordovaFile', '$ionicPopup', '$rootScope', '$http', 'ConfigService', '$state'
    ,'$stateParams','$cordovaGeolocation',
    function($scope, $ionicLoading, ProjectsService, $timeout, $cordovaFile, $ionicPopup, $rootScope, $http, ConfigService, $state, $stateParams,$cordovaGeolocation) {

        $scope.ProjectsService = ProjectsService;

        //var initvalues = false;
        $scope.geoFilter ={};

        /**
         * Alert for raster files
         * @return {[type]} [description]
         */
        var displayRasterPopup = function() {
            $ionicPopup.alert({
                title: 'Raster File',
                template: 'can\'t load Raster file to the map'
            });
        }

        var successFilteredLayers = function(response){
            if($scope.typeLayer === "exposure"){
                $scope.exposureProjects = response.objects;
            }
            if($scope.typeLayer === "damage"){
                $scope.damageProjects = response.objects;                
            }
        }

        var errorFileteredLayers = function(error){
            $cordovaToast.show('An error ocurred, please try again later', 'long', 'center');
        }

        var displayFilteredLayers = function(){
            $cordovaGeolocation
                .getCurrentPosition()
                .then(function(position) {
                    var pt = {
                        "type" : "Feature",
                        "properties" : {},
                        "geometry" : {
                            "type" : "Point",
                            "coordinates" : [position.coords.longitude, position.coords.latitude]
                        }
                    };
                    var unit = 'meters';
                    var buffered = turf.buffer(pt, 500, unit);
                    var result = turf.extent(buffered);
                    var getFilteredLayersPromise = ProjectsService.getFilteredLayers($scope.typeLayer, result);
                    getFilteredLayersPromise.success(successFilteredLayers).error(errorFileteredLayers);

                }, function(err) {
                    // error
                    $cordovaToast.show('Location error, make sure you have GPS enabled', 'long', 'center');
                });
        }

        $scope.changeGeoFilter = function(){
            if($scope.geoFilter.value === true){
                displayFilteredLayers();
            }
            else{
                if($scope.typeLayer === "exposure"){
                    $scope.exposureProjects = ProjectsService.getProjects();
                }
                else if($scope.typeLayer === "damage"){
                    $scope.damageProjects = ProjectsService.getDamageProjects();
                }
            }
        }

        /**
         * Check if the project is a raster file , if it's not then change state to display the layer on the map,
         *  else display a popup
         * @param  {[type]} name [name of the project to open]
         */
        $scope.checkIfRaster = function(name) {
            var project = ProjectsService.getProject(name,$scope.typeLayer);
            var checkRasterPromise = ProjectsService.checkIfRaster(project.id);
            checkRasterPromise.then(function(response) {
                if (response.data.is_raster === false) {
                    $state.go("app.project", { identifier: name, online: true });
                } else displayRasterPopup();
            });
        }
        /*FUNCTIONS OF SUCCESS QUERIES!!!!=================>*/


        $scope.changeType = function(type){
            $scope.typeLayer = type;
            console.log("TYPE ", $scope.typeLayer);
        }

        var errorLoadDamage = function(error){
            $cordovaToast.show('An error ocurred, please try again later', 'long', 'center');
        }
        /**
         * Assign the array of projects to the service
         * @param  {[type]} response [response of the wuery]
         */
        var successLoadProjectsCallback = function(response) {
            var projects = response.objects;
            ProjectsService.setProjects(projects);
            $scope.exposureProjects = projects
        }
        
        /*ERROR FUNCTION*/
        /**
         * Error function if the query for the projects fail
         */
        var errorloadProjectsCallback = function(err) {
            $cordovaToast.show('An error ocurred, please try again later', 'long', 'center');
        }

        var successLoadDamage = function(response){
            var projects = response.objects;
            ProjectsService.setDamageProjects(projects);
            $scope.damageProjects = projects;
        }

        /**
         * Load projects to the service and to the controller
         */
        var loadProjects = function() {
            $scope.loadProjectsPromise = ProjectsService.loadProjects();
            $scope.loadProjectsPromise.success(successLoadProjectsCallback).error(errorloadProjectsCallback);
            $scope.loadDamagePromise = ProjectsService.loadDamageProjects();
            $scope.loadDamagePromise.success(successLoadDamage).error(errorLoadDamage);
        }

        /**
         * load projects only if it's the first time to enter the controller
         * @return {[type]} [description]
         */
        var loadValues = function() {
            if ($scope.initvalues === undefined) {
                $scope.typeLayer = "exposure";
                loadProjects();
                $scope.initvalues = true;
            }
            $scope.typeLayer = $stateParams.typeLayer;
        }

        /**
         * Set project to the service
         * @param {[type]} id [description]
         */
        var setProject = function(id) {
            $scope.ProjectsService.setProject(id);
        }
        loadValues();
    }
]);
