angular.module('starter').controller('ProjectsCtrl', ['$scope', '$ionicLoading', 'ProjectsService', '$timeout', '$cordovaFile', '$ionicPopup', '$rootScope', '$http', 'ConfigService', '$state',

    function($scope, $ionicLoading, ProjectsService, $timeout, $cordovaFile, $ionicPopup, $rootScope, $http, ConfigService, $state) {

        $scope.projects = ProjectsService.getProjects();
        $scope.ProjectsService = ProjectsService;

        var initvalues = false;

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

        /**
         * Check if the project is a raster file , if it's not then change state to display the layer on the map,
         *  else display a popup
         * @param  {[type]} name [name of the project to open]
         */
        $scope.checkIfRaster = function(name) {
            var project = ProjectsService.getProject(name);
            var checkRasterPromise = ProjectsService.checkIfRaster(project.id);
            checkRasterPromise.then(function(response) {
                if (response.data.is_raster === false) {
                    $state.go("app.project", { identifier: name, online: true });
                } else displayRasterPopup();
            });
        }

        /*FUNCTIONS OF SUCCESS QUERIES!!!!=================>*/

        /**
         * Assign the array of projects to the service
         * @param  {[type]} response [response of the wuery]
         */
        var successLoadProjectsCallback = function(response) {
            $scope.projects = response.objects;
            ProjectsService.setProjects($scope.projects);
        }

        /*ERROR FUNCTION*/
        /**
         * Error function if the query for the projects fail
         */
        var errorloadProjectsCallback = function(err) {}


        /**
         * Load projects to the service and to the controller
         */
        var loadProjects = function() {
            $scope.loadProjectsPromise = ProjectsService.loadProjects();
            $scope.loadProjectsPromise.success(successLoadProjectsCallback).error(errorloadProjectsCallback);
        }

        /**
         * load projects only if it's the first time to enter the controller
         * @return {[type]} [description]
         */
        var loadValues = function() {
            if (initvalues === false) {
                loadProjects();
                initvalues = true;
            }
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
