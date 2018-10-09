myApp.factory('zillowServices', function ($rootScope, $http, $q, $filter) {
    var myService = {

        getZillowHouseDetails: function (house) {
            let deferred = $q.defer();
            let address = "";
            let zipCode = "";
            $rootScope.invalidHouses = [];
            const envs = {
                dev: {
                    url: "http://127.0.0.1:3000"
                },
                prod: {
                    url: "http://18.223.26.231:3000"
                }
            };
            const url = envs.prod.url;

            house.address = house.address.replace("undefined", "");
            var matchRes = house.address.match(/\b\d{5}\b/g);
            zipCode = matchRes && matchRes.length > 0 ? house.address.match(/\b\d{5}\b/g) : "";
            address = house.address.replace(zipCode, "");

            $http.get(`${url}/getZillowHouseDetails?address=${address}&zipCode=${zipCode}`).then(function (response) {

                if (!_.isEmpty(response) && !_.isEmpty(response.data) && !_.isEmpty(response.data.response) && !_.isEmpty(response.data.response.results) && !_.isEmpty(response.data.response.results.result) && _.isArray(response.data.response.results.result)) {

                    let res = response.data.response.results.result[0];
                    let filterRes = $filter('filter')($rootScope.houses, {'auctionNumber': house.auctionNumber});
                    house = filterRes && filterRes.length > 0 ? filterRes[0] : house;

                    house.taxAssessment = !_.isEmpty(res.taxAssessment) && _.isArray(res.taxAssessment) ? res.taxAssessment[0] : "";
                    house.zillowEstimate = !_.isEmpty(res.zestimate) && _.isArray(res.zestimate) && !_.isEmpty(res.zestimate[0].amount) && _.isArray(res.zestimate[0].amount) ? res.zestimate[0].amount[0]['_'] : "";
                    house.rooms = !_.isEmpty(res.bedrooms) && _.isArray(res.bedrooms) ? res.bedrooms[0] : "";
                    house.bath = !_.isEmpty(res.bathrooms) && _.isArray(res.bathrooms) ? res.bathrooms[0] : "";
                    house.sqft = !_.isEmpty(res.finishedSqFt) && _.isArray(res.finishedSqFt) ? res.finishedSqFt[0] : "";
                    house.yearBuilt = !_.isEmpty(res.yearBuilt) && _.isArray(res.yearBuilt) ? res.yearBuilt[0] : "";
                    house.zillowID = !_.isEmpty(res.zpid) && _.isArray(res.zpid) ? res.zpid[0] : "";
                    house.zillowLink = !_.isEmpty(res.links) && _.isArray(res.links) && !_.isEmpty(res.links[0].homedetails) && _.isArray(res.links[0].homedetails) ? res.links[0].homedetails[0] : "";
                    house.lastSoldDate = !_.isEmpty(res.lastSoldDate) && _.isArray(res.lastSoldDate) ? res.lastSoldDate[0] : "";
                    house.lastSoldPrice = !_.isEmpty(res.lastSoldPrice) && _.isArray(res.lastSoldPrice) ? res.lastSoldPrice[0]['_'] : "";
                    house.zillowAddress = !_.isEmpty(res.address) && _.isArray(res.address) && !_.isEmpty(res.address[0]) ? res.address[0].street + ', ' + res.address[0].city + ', ' + res.address[0].state + ', ' + res.address[0].zipcode : "";
                    house.coords = {
                        latitude: !_.isEmpty(res.address) && _.isArray(res.address) && !_.isEmpty(res.address[0].latitude) && _.isArray(res.address[0].latitude) ? res.address[0].latitude[0] : undefined,
                        longitude: !_.isEmpty(res.address) && _.isArray(res.address) && !_.isEmpty(res.address[0].longitude) && _.isArray(res.address[0].longitude) ? res.address[0].longitude[0] : undefined
                    };
                    if (house.coords.latitude === undefined || house.coords.longitude === undefined) {
                        $rootScope.invalidHouses.push(house);
                    }

                }
                else {
                    console.log('Auction #: ' + house.auctionNumber + ' was not found in Zillow!');
                    $rootScope.invalidAddressCounter++;
                    $rootScope.invalidHouses.push(house);
                }

                deferred.resolve(house);

            });

            return deferred.promise;
        }

    };

    return myService;

});