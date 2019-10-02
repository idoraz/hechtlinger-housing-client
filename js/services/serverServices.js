myApp.factory('serverServices', function ($http, $q, $templateCache) {
    var myService = {

        env: "dev",

        getEnvUrl: function (env) {
            const envs = {
                dev: {
                    url: "http://localhost:3004"
                },
                prod: {
                    url: "http://34.207.175.86:3004"
                }
            };
            return envs[env].url;
        },

        getHousesNew: function () {
            const auctionID = (moment().month() + 2).toString().padStart(2, '0') + moment().year().toString();
            var promise = $http.get(`http://localhost:3009/api/V1/houses/getHouses/${auctionID}`).then(function (response) {
                return response.data;
            });
            return promise;
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
        getBidListJson: function () {

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

        },

        saveHouses: function (houses) {
            const url = 'http://localhost:3009/api/v1';
            var promise = $http.post(`${url}/houses/saveHouses`, { houses }).then(function (response) {
                return response.data;
            }, function (error) {
                return error;
            });
            return promise;
        }

    };
    return myService;
});