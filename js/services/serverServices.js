myApp.factory('serverServices', function($http, $q, $templateCache) {
    var myService = {

        getHouses: function (link) {

            if (link && link !== "") {
                var promise = $http.get('/getHouses/:' + link).then(function (response) {
                    return response.data;
                });
            }
            else {
                var promise = $http.get('/getHouses').then(function (response) {
                    return response.data;
                });
            }

            return promise;
        },
        parseHouses: function () {

            var promise = $q.defer();

            //pdf2json lib need a timeout to grab the updated files
            setTimeout(function () {
                promise.resolve($http.get('/parseHouses').then(function (response) {
                    if (response.error) {
                        return response;
                    }
                    else {
                        return response.data;
                    }
                }));
            }, 4000);

            return promise.promise;

        },

        getPostponementsJson: function() {

            var promise = $http.get('/getPostponementsJson').then(function (response) {
                return response.data;
            });
            return promise;
            /*
            if (link && link !== "") {
                var promise = $http.get('/getPostponementsJson/:' + link).then(function (response) {
                    return response.data;
                });
                return promise;
            }
            else {
                var promise = $http.get('/getPostponementsJson').then(function (response) {
                    return response.data;
                });
                return promise;
            }*/
        },
        getBidListJson: function() {

            var promise = $http.get('/getBidListJson').then(function (response) {
                return response.data;
            });
            return promise;
            /*
            if (link && link !== "") {
                var promise = $http.get('/getPostponementsJson/:' + link).then(function (response) {
                    return response.data;
                });
                return promise;
            }
            else {
                var promise = $http.get('/getPostponementsJson').then(function (response) {
                    return response.data;
                });
                return promise;
            }*/
        },

        exportExcel: function (houses) {

            var promise = $http({
                method: 'POST',
                url: '/exportExcel',
                data: houses,
                cache: $templateCache
            }).then(function(response) {
                return response.data;
            }, function(response) {
                return response.data || 'failed';
            });
            return promise;

        },
        downloadExcel: function (fileName) {

            var promise = $http.get(`/downloadExcel/${fileName}`, { responseType: "arraybuffer" }).then(function (response) {
                return response.data;
            });
            return promise;
            
        },
        downloadBackup: function () {

            var promise = $http.get(`/downloadBackup`, { responseType: "arraybuffer" }).then(function (response) {
                return response.data;
            });
            return promise;
            
        },
        getLawFirmJson: function () {
            var promise = $http.get('/getLawFirmJson').then(function (response) {
                return response.data;
            });
            return promise;
        },

        getJudgments: function () {
            var promise = $http.get('/getJudgments').then(function (response) {
                return response.data;
            });
            return promise;
        },

        backupHouses: function (houses) {

            var promise = $http({
                method: 'POST',
                url: '/backupHouses',
                data: houses,
                cache: $templateCache
            }).then(function(response) {
                return response.data;
            }, function(response) {
                return response.data || 'Request failed';
            });
            return promise;

        }

    };
    return myService;
});