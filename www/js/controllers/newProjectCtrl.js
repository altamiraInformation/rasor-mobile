angular.module('starter').controller('NewProjectCtrl', ['$scope', '$ionicModal', 'ConfigService', 'ProjectsService', '$state', '$ionicHistory', '$cordovaToast',
    function($scope, $ionicModal, ConfigService, ProjectsService, $state, $ionicHistory, $cordovaToast) {



        /**
         * new project object
         * @type {Object}
         */
        $scope.project = {
            fileName: '',
            type: 'FeatureCollection',
            features: [],
            metadata: {
                date: new Date(),
                type: 'Exposure',
                hazards: {},
                impacts: {},
                category: {}
            }
        };


        /**
         * Opens a modal for edit the properties of a new project.
         * @return {[type]} [description]
         */
        $scope.openModal = function() {
            $ionicModal.fromTemplateUrl('templates/newProjectModal.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.newProjectModal = modal;
                $scope.newProjectModal.show();
            });
        }

        $scope.closeInfoLayerModal = function() {
            $scope.newProjectModal.hide();

        }

        /**
         * Load objects for new project options {impact types, hazards, categories}
         */
        var init = function() {
            $scope.impactTypes = ConfigService.getImpactTypes();
            $scope.hazards = ConfigService.getHazards();
            $scope.categories = ConfigService.getCategories();
        }

        init();


        /**
         * check if fields are filled before create the new project
         */
        var alertName = function() {
            $cordovaToast.show('You have to specify a name for the project', 'long', 'center');
        }

        /**
         * Assign category ID to the new project.
         */
        var assignCategoryID = function() {
            var size = $scope.categories.length;
            for (var i = 0; i < size; ++i) {
                if ($scope.categories[i].name === $scope.project.metadata.category.name) {
                    $scope.project.metadata.category.id = $scope.categories[i].id;
                }
            }
        }


        /**
         * If save the new project sucess then display a map with the new project.
         * @return {[type]} [description]
         */
        var successSave = function() {
            $state.go("app.project", { identifier: $scope.project.fileName + ".geojson" });
        }


        /**
         * Save new project to local 
         * @return {[type]} [description]
         */
        $scope.saveNewProject = function() {
            if ($scope.project.fileName === '') alertName();
            else {
                assignCategoryID();
                var savePromise = ProjectsService.saveToLocalProjects($scope.project);
                savePromise.then(function(response) {
                    ProjectsService.updateLocalProjects();
                    successSave();
                });
            }
        }

    }
]);
