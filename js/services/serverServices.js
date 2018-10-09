myApp.factory('serverServices', function ($http, $q, $templateCache) {
    var myService = {

        env: "dev",

        getEnvUrl: function (env) {
            const envs = {
                dev: {
                    url: "http://localhost:3000"
                },
                prod: {
                    url: "http://18.223.26.231:3000"
                }
            };
            return envs[env].url;
        },

        getHouses: function (link) {

            if (link && link !== "") {
                var promise = $http.get(`${this.getEnvUrl(this.env)}/getHouses`).then(function (response) {
                    return response.data;
                });
            }
            else {
                var promise = $http.get(`${this.getEnvUrl(this.env)}/getHouses`).then(function (response) {
                    return response.data;
                });
            }

            return promise;
        },
        parseHouses: function () {

            var promise = $q.defer();

            const that = this;
            
            //pdf2json lib need a timeout to grab the updated files
            setTimeout(function () {
                promise.resolve($http.get(`${that.getEnvUrl(that.env)}/parseHouses`).then(function (response) {
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

        getPostponementsJson: function () {

            var promise = $http.get(`${this.getEnvUrl(this.env)}/getPostponementsJson`).then(function (response) {
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

            var promise = $http.get(`${this.getEnvUrl(this.env)}/getBidListJson`).then(function (response) {
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
                url: `${this.getEnvUrl(this.env)}/exportExcel`,
                data: houses,
                cache: $templateCache
            }).then(function (response) {
                return response.data;
            }, function (response) {
                return response.data || 'failed';
            });
            return promise;

        },
        downloadExcel: function (fileName) {

            var promise = $http.get(`${this.getEnvUrl(this.env)}/downloadExcel/${fileName}`, { responseType: "arraybuffer" }).then(function (response) {
                return response.data;
            });
            return promise;
            
        },
        downloadBackup: function () {

            var promise = $http.get(`${this.getEnvUrl(this.env)}/downloadBackup`, { responseType: "arraybuffer" }).then(function (response) {
                return response.data;
            });
            return promise;
            
        },
        getLawFirmJson: function () {
            var promise = $http.get(`${this.getEnvUrl(this.env)}/getLawFirmJson`).then(function (response) {
                return response.data;
            });
            return promise;
        },

        getJudgments: function () {
            var promise = $http.get(`${this.getEnvUrl(this.env)}/getJudgments`).then(function (response) {
                return response.data;
            });
            return promise;
        },

        backupHouses: function (houses) {

            var promise = $http({
                method: 'POST',
                url: `${this.getEnvUrl(this.env)}/backupHouses`,
                data: houses,
                cache: $templateCache
            }).then(function (response) {
                return response.data;
            }, function (response) {
                return response.data || 'Request failed';
            });
            return promise;

        }

    };
    return myService;
});