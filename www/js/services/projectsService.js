angular.module('starter').factory('ProjectsService', ['$http', '$cordovaFileTransfer', '$ionicPopup', '$rootScope', '$cordovaFile',

    function($http, $cordovaFileTransfer, $ionicPopup, $rootScope, $cordovaFile) {
        var server = 'http://130.251.104.198/';
        //server = 'http://localhost:1337/130.251.104.198/';
        var projects = [];
        var damageProjects = [];
        var currentProject;
        var localProjects = [];



        /**
         * add the names of the local projects te localProjects array
         * @param  {[type]} entries [description]
         * @return {[type]}         [description]
         */
        var success = function(entries) {
            localProjects = [];
            for (var i = 0; i < entries.length; ++i) {
                localProjects.push(entries[i].name);
            }
        }


        /**
         * failing on read directory content.
         * @param  {[type]} error [description]
         * @return {[type]}       [description]
         */
        var fail = function(error) {
            console.log("Failed to list directory contents: ", error);
        }

        /**
         * Iterates over localprojects folder in the device to return al projects inside the folder
         * @return {[type]} [description]
         */
        var loadLocalProjects = function() {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory + "localprojects", function(dirEntry) {
                var directoryReader = dirEntry.createReader();
                directoryReader.readEntries(success, fail);
            });
        }

        $rootScope.$on("cordovaReady", loadLocalProjects);

        return {
            /**
             * Get project 
             * @param  {[type]} name [Name of the project]
             * @return {[type]}      [return the project from the array of project with title === name]
             */
            getProject: function(name, typeLayer) {
                if(typeLayer === 'exposure'){
                    var size = projects.length;
                    for (var i = 0; i < size; ++i) {
                        if (projects[i].title === name) return projects[i];
                    }
                }
                else if(typeLayer === 'damage'){
                    var size = damageProjects.length;
                    console.log("damage projects", damageProjects);
                    for (var i = 0; i < size; ++i) {
                        if (damageProjects[i].title === name) return damageProjects[i];
                    }
                }
            },
            getOnlineProject: function(name){
                var size = projects.length;
                for (var i = 0; i < size; ++i) {
                    if (projects[i].title === name) return projects[i];
                }
                var size = damageProjects.length;
                //console.log("damage projects", damageProjects);
                for (var i = 0; i < size; ++i) {
                    if (damageProjects[i].title === name) return damageProjects[i];
                }
            },
            /**
             * Get projects
             * @return {[type]} [return the entire array of projects]
             */
            getProjects: function() {
                return projects;
            },
            /**
             * set a new array of projects to projects
             * @param {[type]} proj [array of new projects]
             */
            setProjects: function(proj) {
                projects = proj;
            },
            login: function(username, password) {
                var url = server + 'rasorapi/user/login/';
                var options = {
                    headers: {
                        'content-type': 'application/json',
                    }
                };
                var data = {
                    username: username,
                    password: password
                };
                return $http.post(url, data, options);
            },

            /**
             * make query to api to get all the projects
             * @return {[type]} [return result of http.get]
             */
            loadProjects: function() {
                return $http.get(server + '/api/layers/?keywords__slug__in=rasor_exposure');
            },
            loadDamageProjects: function(){
                return $http.get(server + '/api/layers/?keywords__slug__in=rasor_impact');
            },
            setDamageProjects: function(projects){
                damageProjects = projects;
            },
            getDamageProjects: function(){
                return damageProjects;
            },
            getFilteredLayers: function(type, bbox){
                var aux = [];
                for(var i =0; i < bbox.length;++i){
                    aux[i] = Math.round( bbox[i] );
                }
                //var bboxParam = bbox[0].toString()+','bbox[1].toString()+','bbox[2].toString()+','+bbox[3].toString();
                var bboxParam = bbox[0]+','+bbox[1]+','+bbox[2]+','+bbox[3];
                return $http.get(server + '/api/layers/?keywords__slug__in=rasor_'+type+'&extent='+bboxParam);
            },
            /**
             * make query to API to get the shapefile of given layer name
             * @param  {[type]} layername [name of the layer to downlaod]
             * @return {[type]}           [result of the query to the API]
             */
            downloadZip: function(layername) {
                var url = server + "geoserver/wfs?typename=geonode%3A" + layername +
                    "&outputFormat=shape-zip&version=1.0.0&service=WFS&request=GetFeature";

                var options = {
                    responseType: 'arraybuffer',
                    cache: false,
                    headers: {
                        'Content-Type': 'application/zip; charset=utf-8',
                    }
                };
                return $http.get(url, options);
            },
            /**
             * Save a layer in the device (local)
             * @param  {[type]} geojson [geojson to save]
             * @return {[type]}         [response of the writefile]
             */
            saveToLocalProjects: function(geojson) {
                JSON.stringify(geojson);
                return $cordovaFile.writeFile(cordova.file.dataDirectory + "localprojects", geojson.fileName + ".geojson", geojson, true);

            },
            /**
             * Upload selected layer to the API
             * @param  {[type]} entry [Layer to upload]
             */
            uploadLayer: function(entry, categoryID) {
                var options = {
                    withCredentials: 'true',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };
                var url = server + 'rasorapi/exposure/uploadandimport/' + entry.fileName + '/' + categoryID.toString() + '/';
                /*var fd = new FormData();
                fd.append("data",JSON.stringify(entry));
                */
                var data = JSON.stringify(entry);
                return $http.post(url, data, options);
            },
            /**
             * Checks if a Layer is raster
             * @param  {[type]} id [ID of the layer]
             * @return {[type]}    [returns the Response of tha call to the API]
             */
            checkIfRaster: function(id) {
                return $http.get(server + "rasorapi/layers/" + id);
            },
            /**
             * Get the names of the projects saved in the device
             * @return {[type]} [Array of project names]
             */
            getLocalProjects: function() {
                //loadLocalProjects();
                return localProjects;
            },
            /**
             * Remove file from local system
             * @param  {[type]} name [name of the layer to delete]
             * @return {[type]}      [returns response of removeFile]
             */
            removeFile: function(name) {
                return $cordovaFile.removeFile(cordova.file.dataDirectory + "localprojects", name);
            },
            updateLocalProjects: function() {
                loadLocalProjects();
            },
            /**
             * Set a new array of projects
             * @param {[type]} projects [new array for localProjects]
             */
            setLocalProjects: function(projects) {
                localProjects = projects;
            },
            /**
             * Gets project saved in the device with given name
             * @param  {[type]} name [name of the project]
             * @return {[type]}      [returns respnse of readAsText]
             */
            getLocalProject: function(name) {
                return $cordovaFile.readAsText(cordova.file.dataDirectory + "localprojects", name);
            }

        }

    }
]);
