angular.module('starter').controller('LocalProjectsCtrl', ['$scope', 'ProjectsService', '$cordovaFile', '$ionicPopup', '$ionicModal', 'ConfigService', '$cordovaToast',

    function($scope, ProjectsService, $cordovaFile, $ionicPopup, $ionicModal, ConfigService, $cordovaToast) {

        $scope.ProjectsService = ProjectsService;
        $scope.user = {
            username: '',
            password: ''
        };
        var selectedIndex;
        var entryUpload;
        $scope.categories = ConfigService.getCategories();
        $scope.category = {};
        /*
         * Get local projects saved in the device.
         */
        $scope.loadLocalProjects = function() {
            $scope.localProjects = ProjectsService.getLocalProjects();
        }

        /**
         * call function before entering the view
         */
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.loadLocalProjects();
            $ionicModal.fromTemplateUrl('templates/login.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.loginModal = modal;
            });
        })
        $scope.loadLocalProjects();



        /*var searchCategoryID = function(){
            for(var i = 0; i < $scope.categories.length; ++i){
                console.log($scope.categories[i]);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                console.log("scope category name", $scope.categoryName);
                if($scope.categoryName === $scope.categories[i].name) return $scope.categories[i].id;
            }
        }*/

        var uploadProject = function(entryUpload) {
            var getLocalPromise = ProjectsService.getLocalProject(entryUpload);
            getLocalPromise.then(function(response) {
                var geojson = JSON.parse(response);
                var uploadPromise = ProjectsService.uploadLayer(geojson, $scope.category.params.id);
                uploadPromise.then(function(response) {
                    $scope.hideLogin();
                    $cordovaToast.show('Upload success', 'long', 'center');
                }, function(error) {
                    $cordovaToast.show('An error ocurred while uploading layer', 'long', 'center');
                })
            });
        }


        /**
         * Choose catagory for the layer to upload
         * @param  {[type]} entryUpload [Layer to upload to the server]
         * @return {[type]}             [description]
         */
        var categoryChoose = function(entryUpload) {
            var popupTemplate = '<label class="item item-input item-select">' +
                '<div class="input-label">' +
                'Category' +
                '</div>' +
                '<select ng-options="category.name for category in categories" ng-model="category.params">' +
                '<option></option>' +
                '</select>' +
                '</label>';
            $ionicPopup.show({
                template: popupTemplate,
                title: 'Select category exposure',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' }, {
                        text: '<b>Upload</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if ($scope.category.params === undefined) {
                                $cordovaToast.show('You must specify a cateory for the layer', 'long', 'center');
                            } else {
                                uploadProject(entryUpload);
                                //e.preventDefault();
                            }
                        }
                    }
                ]
            });
        }


        /**
         * checks if the query of username and password is correct(code === 200), if it's correct, 
         * enables the category choose feature and then upload the file.
         * @return {[type]} [description]
         */
        $scope.loginAndUpload = function() {
            var loginPromise = ProjectsService.login($scope.user.username, $scope.user.password);
            loginPromise.then(function(response) {
                if (response.status === 200) {
                    categoryChoose(entryUpload);
                } else if (response.status === 401) {
                    $cordovaToast.show('Invalid username or password', 'long', 'center');
                }
            }, function(error) {
                $cordovaToast.show('An error occurred while login in', 'long', 'center');
            });
        }

        // Triggered in the login modal to close it
        $scope.hideLogin = function() {
            $scope.loginModal.hide();
        };

        /**
         * [upload description]
         * @param  {[type]} entry [layer to upload]
         * @param  {[type]} event [click event]
         * @param  {[type]} index [index of the project in the array]
         */
        $scope.upload = function(entry, event, index) {
            event.preventDefault();
            entryUpload = entry;
            $scope.loginModal.show();

        }

        /**
         * Delete removed project from the array of localProjects
         * @param  {[type]} response [response of the remove]
         * @param  {[type]} index    [index of the project in the array]
         */
        var successRemoveLocal = function(response) {
            $scope.localProjects.splice(selectedIndex, 1);
            ProjectsService.setLocalProjects($scope.localProjects);
        }

        /**
         * Error function removing a project
         */
        var errorRemoveLocal = function(err) {
            console.log("error removing local", err);
        }


        /**
         * Promise of deleting file with given entry name
         * @param  {[type]} entry [name of the file to delete]
         * @param  {[type]} index [index of the file in the array]
         */
        var deleteFile = function(entry, index) {
            var removeFilePromise = ProjectsService.removeFile(entry);
            removeFilePromise.then(successRemoveLocal, errorRemoveLocal);
        }


        /**
         * show a confirmation pop up to advice the user that is going to delete a project from local
         * @param  {[type]} entry [entry to delete]
         * @param  {[type]} event [clock event]
         * @param  {[type]} index [index of the project in the array]
         */
        $scope.delete = function(entry, event, index) {
            event.preventDefault();
            selectedIndex = index
            $ionicPopup.confirm({
                title: 'Delete project',
                template: 'Are you sure you want to delete ' + entry + "?"
            }).then(function(res) {
                if (res) {
                    deleteFile(entry, index);
                } else {
                    console.log('You are not sure');
                }
            });
        }
    }
]);
