myApp.constant("moment", moment);

myApp.controller('mainCtrl', ['$scope', '$rootScope', 'serverServices', 'zillowServices', 'House', '$q', 'uiGmapGoogleMapApi', '$localStorage', '$filter', '$timeout', 'moment', '$window', function ($scope, $rootScope, serverServices, zillowServices, House, $q, uiGmapGoogleMapApi, $localStorage, $filter, $timeout, moment, $window) {

    /**************
     *** Members ***
     **************/

    $scope.vm = {
        alerts: [],
        loading: false,
        exportFileName: ""
    };
    $scope.map = {
        center: {
            latitude: 40.445,
            longitude: -79.997
        },
        zoom: 11
    };
    $rootScope.houses = !_.isEmpty($localStorage.houses) && $localStorage.houses.length > 0 ? $localStorage.houses : [];
    $scope.ppmnts = !_.isEmpty($localStorage.ppmnts) && $localStorage.ppmnts.Pages.length > 0 ? $localStorage.ppmnts : [];
    $scope.bdlst = !_.isEmpty($localStorage.bdlst) && $localStorage.bdlst.Pages.length > 0 ? $localStorage.bdlst : [];
    $scope.mapOptions = {
        minZoom: 3,
        zoomControl: false,
        draggable: true,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        markers: {
            selected: {}
        }
    };
    const docketRegex = /([A-Z])\w+-\d{2}-\d{6}/g; //Docket# regex - the anchor where our listing starts
    const addressRegex = /\b(p\.?\s?o\.?\b|post office|\d{1,5}|\s)\s*(?:\S\s*){8,50}(AK|Alaska|AL|Alabama|AR|Arkansas|AZ|Arizona|CA|California|CO|Colorado|CT|Connecticut|DC|Washington\sDC|Washington\D\.C\.|DE|Delaware|FL|Florida|GA|Georgia|GU|Guam|HI|Hawaii|IA|Iowa|ID|Idaho|IL|Illinois|IN|Indiana|KS|Kansas|KY|Kentucky|LA|Louisiana|MA|Massachusetts|MD|Maryland|ME|Maine|MI|Michigan|MN|Minnesota|MO|Missouri|MS|Mississippi|MT|Montana|NC|North\sCarolina|ND|North\sDakota|NE|New\sEngland|NH|New\sHampshire|NJ|New\sJersey|NM|New\sMexico|NV|Nevada|NY|New\sYork|OH|Ohio|OK|Oklahoma|OR|Oregon|PA|Pennsylvania|RI|Rhode\sIsland|SC|South\sCarolina|SD|South\sDakota|TN|Tennessee|TX|Texas|UT|Utah|VA|Virginia|VI|Virgin\sIslands|VT|Vermont|WA|Washington|WI|Wisconsin|WV|West\sVirginia|WY|Wyoming)(\s+|\&nbsp\;|\<(\S|\s){1,10}\>){1,5}\d{5}/i; //Address regex - the anchor where our listing ends
    const freeAndClearRegex = /F&C|F\s&\sC|FC|FREE\sAND\sCLEAR|FREE\s&\sCLEAR/gi;

    /**************
     *** Methods ***
     **************/

    $scope.init = function () {
        console.log($rootScope.houses); //For debugging        
        $scope.vm.loading = true;
        checkGlblPPDate();
        $scope.vm.kml = parseToKml();
        downloadKml();
        serverServices.getLawFirmJson().then(function (res) {
            getJudgments();
            $rootScope.lawFirmsIndex = {};
            $rootScope.lawFirms = res;
            let lawFirmsRegex = "";
            for (var i = 0; i < res.length; i++) {
                $rootScope.lawFirmsIndex[res[i]["Name on file"]] = i;
                lawFirmsRegex += res[i]["Name on file"] + '|';

            }
            lawFirmsRegex = lawFirmsRegex.substring(0, lawFirmsRegex.length - 1);
            $rootScope.lawFirmsRegex = new RegExp(lawFirmsRegex, 'gi');
            refresh().then(function () {
                $scope.vm.loading = false;
            });
        });

    };
    var refresh = function (link) {

        var deferred = $q.defer();

        try {
            serverServices.getHouses(link && link !== "" ? link : undefined).then(function (res) {
                serverServices.parseHouses().then(function (res) {
                    if (res.error) {
                        $scope.vm.alerts.push({
                            type: 'danger',
                            msg: res.message
                        });
                    }
                    serverServices.getBidListJson().then(function (res) {
                        $scope.bdlst = res.formImage;
                        serverServices.getPostponementsJson().then(function (res) {
                            $scope.ppmnts = res.formImage;
                            checkGlblPPDate();
                            deferred.resolve();
                        });
                    });
                });
            });
        } catch (ex) {
            deferred.reject(ex);
        }

        return deferred.promise;
    };

    var parseToKml = function () {

        $scope.vm.kmlFileName = `Houses ${new moment().format('DD-MM-YYYYTHH-mm')}.kml`;
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let currentMonth = months[new Date().getMonth()];
        let kml = [];

        kml.push('<kml xmlns = "http://www.opengis.net/kml/2.2"><Document><name>');
        kml.push(currentMonth);
        kml.push('</name><open>1</open><description>');
        kml.push(currentMonth + ' postponements</description><name>Placemarks</name>');
        kml.push('<Style id = "stayPlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/grey.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "mortgageExpensivePlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/red-dot.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "mortgagePlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/red.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "taxLienExpensivePlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "taxLienPlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/yellow.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "freeAndClearExpensivePlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/blue-dot.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "freeAndClearPlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/blue.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "bankExpensivePlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/green-dot.png', '</href></Icon></IconStyle></Style>');
        kml.push('<Style id = "bankPlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/green.png', '</href></Icon></IconStyle></Style>');
        /*kml.push('<Style id = "invalidZillowPlacemark"><IconStyle><Icon><href>');
        kml.push('http://maps.google.com/mapfiles/ms/icons/purple.png', '</href></Icon></IconStyle></Style>');*/
        kml.push('<LookAt><longitude>-79.997</longitude><latitude>40.445</latitude><altitude>0</altitude>');
        kml.push('<heading>-148.4122922628044</heading><tilt>0</tilt><range>500000</range></LookAt>');

        angular.forEach($rootScope.houses, function (house, key) {
            kml.push(buildKmlString(house));
        });

        kml.push('</Document></kml>');
        kml = kml.join("");

        return kml;

    };
    var downloadKml = function () {
        $scope.vm.kml = parseToKml();

        if (!_.isEmpty($scope.vm.kml)) {
            let blob = new Blob([$scope.vm.kml], {
                type: 'application/vnd.google-earth.kml+xml'
            });
            $scope.vm.url = (window.URL || window.webkitURL).createObjectURL(blob);
        } else {
            console.log('KML string is empty, download was aborted!');
        }
    };
    var downloadExcel = function (fileName) {

        if (fileName) {

            serverServices.downloadExcel(fileName).then(function (response) {
                if (response) {
                    let blob = new Blob([response], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    $scope.vm.excelUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                    $timeout(function () {
                        angular.element(exportDownloadButton)[0].click();
                        $scope.vm.alerts.push({
                            type: 'success',
                            msg: 'Houses were successfully Downloaded!'
                        });
                        URL.revokeObjectURL($scope.vm.excelUrl);
                        $scope.vm.excelUrl = undefined;
                    }, 1000);
                } else {
                    $scope.vm.alerts.push({
                        type: 'danger',
                        msg: 'Houses failed to export!'
                    });
                }
            });

        }

    }
    var downloadBackup = function () {

        serverServices.downloadBackup().then(function (response) {
            if (response) {
                let blob = new Blob([response], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                $scope.vm.backupUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                $timeout(function () {
                    angular.element(backupDownloadButton)[0].click();
                    $scope.vm.alerts.push({
                        type: 'success',
                        msg: 'Backup file was successfully Downloaded!'
                    });
                    URL.revokeObjectURL($scope.vm.backupUrl);
                    $scope.vm.backupUrl = undefined;
                }, 1000);
            } else {
                $scope.vm.alerts.push({
                    type: 'danger',
                    msg: 'Backup failed to download!'
                });
            }
        });

    }

    var findMaxOccurences = function (array) {
        if (array.length == 0)
            return null;
        var modeMap = {};
        var maxEl = array[0],
            maxCount = 1;
        for (var i = 0; i < array.length; i++) {
            var el = array[i];
            if (modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;
            if (modeMap[el] > maxCount) {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
    }
    var checkGlblPPDate = function () {
        dates = [];
        angular.forEach($rootScope.houses, function (house, key) {
            if (house.isPP && house.ppDate && house.ppDate !== '') {
                dates.push(house.ppDate);
            }
        });
        const date = findMaxOccurences(dates);
        $scope.glblPPDate = new Date(date);
        console.log(`Global postponements date: ${$scope.glblPPDate}`);

        // if (!$scope.ppmnts || !$scope.ppmnts.Pages) return;
        // $scope.glblPPDate = new Date(Date.parse(unescape($scope.ppmnts.Pages[1].Texts[1].R[0].T)));
    };

    var translatePDF = function (pages, isPP) {

        var isInListingRange = false;
        let listing = [];
        let retVal = [];

        angular.forEach(pages, function (page, key) {

            let index = 0;
            let last = page.Texts.length;
            let checksCounter = 0;

            while (index < last) {

                try {
                    let addToListing = false;

                    if (page.Texts[index] !== undefined && (page.Texts[index].hasOwnProperty('y') && page.Texts[index].y !== 35.691 && page.Texts[index].y !== 1.5219999999999998)) { // If text is in valid range of page

                        if (page.Texts[index].R[0].T.match(docketRegex)) { // Current text is the docket# this is where the listing starts
                            listing = [];
                            isInListingRange = true;
                        }

                        if (isInListingRange) {

                            addToListing = true;

                            if (page.Texts[index].x >= 51 && page.Texts[index].x <= 52) { // Current text is the Reason For PP text which follows with the checks

                                //TODO: If we don't have a reason for PP we'll get a house with unordered details
                                listing.push(unescape(page.Texts[index].R[0].T)); // Adding Reason for PP

                                if (page.Texts[index + 1].R[0].T === "Y") {
                                    listing.push(unescape(page.Texts[index + 1].R[0].T));
                                    checksCounter++;
                                } else {
                                    listing.push("X");
                                }

                                if (page.Texts[index + 2].R[0].T === "Y") {
                                    listing.push(unescape(page.Texts[index + 2].R[0].T));
                                    checksCounter++;
                                } else {
                                    listing.push("X");
                                }

                                if (page.Texts[index + 3].R[0].T === "Y") {
                                    listing.push(unescape(page.Texts[index + 3].R[0].T));
                                    checksCounter++;
                                } else {
                                    listing.push("X");
                                }

                                addToListing = false;

                            }

                            if (page.Texts[index].x === page.Texts[index - 1].x) { // Multi-lines scenario
                                listing[listing.length - 1] += unescape(page.Texts[index].R[0].T);
                                addToListing = false;
                            }

                            if (unescape(page.Texts[index].R[0].T).match(addressRegex)) { //First address was found

                                let addindex = index;
                                let addresses = [];
                                let house;
                                let isFreeAndClear = false;

                                while (page.Texts[addindex] && !unescape(page.Texts[addindex].R[0].T).match(docketRegex)) { //Search for multiple addresses
                                    if (unescape(page.Texts[addindex].R[0].T).match(addressRegex)) {
                                        addresses.push(unescape(page.Texts[addindex].R[0].T));
                                    }
                                    if (unescape(page.Texts[addindex].R[0].T).match(freeAndClearRegex)) {
                                        isFreeAndClear = true;
                                    }

                                    addindex++;
                                }

                                angular.forEach(addresses, function (address, key) {
                                    let tempLst = angular.copy(listing);
                                    tempLst.push(address);
                                    house = House.createNew(tempLst, isPP, isFreeAndClear, addresses.length > 1);
                                    retVal.push(house);
                                });

                                listing = [];
                                addToListing = false;
                            }
                        }
                    }

                    if (addToListing) {
                        listing.push(unescape(page.Texts[index].R[0].T));
                    }
                    if (checksCounter > 0) {
                        index += checksCounter + 1;
                        checksCounter = 0;
                    } else {
                        index++;
                    }
                } catch (ex) {
                    console.log(ex.stack);
                    index++;
                }
            }
        });

        return retVal;
    };

    var buildKmlString = function (house) {
        let stream = [];
        let markerType = analyzeMarkerType(house);

        try {
            stream.push('<Placemark>');
            stream.push('<name>', house.zillowAddress, '</name>');
            stream.push('<styleUrl>', markerType, '</styleUrl>');
            stream.push('<ExtendedData>');
            stream.push('<Data name="Auction Number"><value>', house.auctionNumber, '</value></Data>');
            stream.push('<Data name="Sale Type"><value>', house.saleType, '</value></Data>');
            stream.push('<Data name="Judgment"><value>', $filter('currency')(house.judgment, '$', 2), '</value></Data>');
            stream.push('<Data name="Tax Estimate"><value>', $filter('currency')(house.taxAssessment, '$', 2), '</value></Data>');
            stream.push('<Data name="Zillow Estimate"><value>', $filter('currency')(house.zillowEstimate, '$', 2), '</value></Data>');
            stream.push('<Data name="Last Sold Price"><value>', $filter('currency')(house.lastSoldPrice, '$', 2), '</value></Data>');
            stream.push('<Data name="Last Sold Date"><value>', house.lastSoldDate, '</value></Data>');
            stream.push('<Data name="Sqft"><value>', $filter('number')(house.sqft, 2), '</value></Data>');
            stream.push('<Data name="Rooms"><value>', house.rooms, '</value></Data>');
            stream.push('<Data name="Baths"><value>', house.bath, '</value></Data>');
            stream.push('<Data name="Year Built"><value>', house.yearBuilt, '</value></Data>');
            stream.push('<Data name="Attorney Name"><value>', house.attorneyName, '</value></Data>');
            if (house.firmName) {
                stream.push('<Data name="Firm Name"><value>', house.firmName, '</value></Data>');
            }
            if (house.contactEmail) {
                stream.push('<Data name="Contact Email"><value>', house.contactEmail, '</value></Data>');
            }
            stream.push('<Data name="Plaintiff Name"><value>', house.plaintiffName.replace(new RegExp('&', 'g'), 'and'), '</value></Data>');
            stream.push('<Data name="Cost Tax"><value>', house.costTax && house.costTax !== "" ? '$' + house.costTax : house.costTax, '</value></Data>');
            stream.push('<Data name="Checks"><value>', house.checks.svs + ' ' + house.checks['3129'] + ' ' + house.checks.ok, '</value></Data>');
            stream.push('<Data name="Docket Number"><value>', house.docketNumber, '</value></Data>');
            stream.push('<Data name="Zillow Link"><value>', house.zillowLink, '</value></Data>');
            stream.push('<Data name="Duplicate"><value>', house.isDuplicate, '</value></Data>');
            if (house.ppDate) {
                let str = house.ppDate;
                //str += !_.isEmpty(house.reasonForPP) ? ' (' + house.reasonForPP + ')' : '';
                stream.push('<Data name="PP Date"><value>', str, '</value></Data>');
            }
            stream.push('</ExtendedData>');
            stream.push('<Point>');
            stream.push('<coordinates>', house.coords.longitude, ',', house.coords.latitude, ',0</coordinates>');
            stream.push('</Point></Placemark>');

            return stream.join("");
        } catch (ex) {
            return "";
        }
    };
    var analyzeMarkerType = function (house) {

        try {
            if (house.saleStatus && house.saleStatus === "STAYED") {
                return "#stayPlacemark";
            }
            if (house.ppDate && $scope.glblPPDate && new Date(house.ppDate) > $scope.glblPPDate) {
                return "#stayPlacemark";
            }

            if (house.isFC) {
                if (house.zillowEstimate > 85000) {
                    return "#freeAndClearExpensivePlacemark";
                }

                return "#freeAndClearPlacemark";
            }

            if (house.isBank) {
                if (house.zillowEstimate > 85000) {
                    return "#bankExpensivePlacemark";
                }

                return "#bankPlacemark";
            }

            if (house.saleType && house.saleType === "T") {
                if (house.zillowEstimate > 85000) {
                    return "#taxLienExpensivePlacemark";
                }

                return "#taxLienPlacemark";

            }

            if (house.saleType && house.saleType === "M") {
                if (house.zillowEstimate > 85000) {
                    return "#mortgageExpensivePlacemark";
                }

                return "#mortgagePlacemark";

            }

        } catch (ex) {
            console.log(ex.stack);
            return "#mortgagePlacemark";
        }

    };

    var deleteInvalidHouses = function (houses) {

        let indices = [];

        angular.forEach(houses, function (house, index) {
            let i = $rootScope.houses.indexOf(house);
            if (i !== -1) {
                indices.push(i);
            }
        });

        indices = indices.sort(function (a, b) {
            return a - b
        });

        for (let j = indices.length - 1; j >= 0; j--) {
            $rootScope.houses.splice(indices[j], 1);
        }

    };

    var getJudgments = function () {
        serverServices.getJudgments().then(function (response) {
            $rootScope.judgments = response;
            setJudgments();
        });
    }
    var setJudgments = function () {
        for (let house of $rootScope.houses) {
            house.judgment = $rootScope.judgments.hasOwnProperty(house.docketNumber) ? $rootScope.judgments[house.docketNumber] : house.judgment;
        }
    }

    /*************
     *** Events ***
     *************/

    uiGmapGoogleMapApi.then(function (maps) {

        $scope.map = {
            center: {
                latitude: 40.445,
                longitude: -79.997
            },
            zoom: 11,
            markerEvents: {
                click: function (marker) {
                    $scope.onClick(marker.model);
                    $scope.mapOptions.markers.selected = marker.model;
                }
            },
            options: $scope.mapOptions
        };

        $scope.windowOptions = {
            show: false,
            pixelOffset: new google.maps.Size(0, -32),
            /*boxClass: "infobox",
            boxStyle: {
                backgroundColor: "transparent",
                border: "1px solid #C7CECE",
                borderRadius: "5px",
                width: "85%"
            },
            disableAutoPan: false,
            maxWidth: 0,
            infoBoxClearance: new google.maps.Size(1, 1),
            zIndex: null,
            isHidden: false,
            pane: "floatPane",
            enableEventPropagation: false*/
        };

    });
    $scope.onClick = function (data) {
        $scope.windowOptions.show = true;
    };
    $scope.closeClick = function () {
        $scope.windowOptions.show = false;
    };

    $scope.vm.updateHousesOnMap = function () {

        $scope.vm.loading = true;
        $rootScope.houses = [];
        $rootScope.multiAddressHouses = [];
        $localStorage.houses = [];
        $localStorage.ppmnts = {};
        $localStorage.bdlst = {};

        refresh().then(function () {

            $rootScope.houses = translatePDF($scope.ppmnts.Pages, true);
            $rootScope.bdlst = translatePDF($scope.bdlst.Pages, false);
            $rootScope.houses = $rootScope.houses.concat($rootScope.bdlst);
            $rootScope.invalidAddressCounter = 0;

            let requests = [];

            angular.forEach($rootScope.houses, function (house, key) {
                requests.push(zillowServices.getZillowHouseDetails(house));
            });

            $q.all(requests).then(function (response) {
                // TODO: Removed because we don't want to lose invalid houses. Instead we'll want to run them again in google
                // if (!_.isEmpty($rootScope.invalidHouses) && $rootScope.invalidHouses.length > 0) {
                //     deleteInvalidHouses($rootScope.invalidHouses);
                // }

                //TODO: Consider replacing KML handling with $scope.init()
                $scope.vm.kml = parseToKml();
                downloadKml();

                $scope.vm.saveHouses(true);
                $scope.vm.backupHouses();
                $scope.vm.loading = false;

                if ($rootScope.invalidAddressCounter && $rootScope.invalidAddressCounter > 0) {
                    console.log($rootScope.invalidAddressCounter + ' houses were not found on Zillow');
                }

                $scope.vm.alerts.push({
                    type: 'success',
                    msg: 'Houses were successfully updated!'
                });

                $timeout(function () {
                    $window.location.reload();
                }, 3000);

            });

        }, function (error) {
            console.log(error.stack);
            $scope.vm.loading = false;
            $scope.vm.alerts.push({
                type: 'danger',
                msg: 'Houses failed to update!'
            });
        });

    };
    $scope.vm.downloadKml = function () {
        $scope.vm.alerts.push({
            type: 'success',
            msg: 'KML was downloaded successfully!'
        });
    }
    $scope.vm.exportXslx = function () {

        serverServices.exportExcel($rootScope.houses).then(function (response) {
            if (response === 'failed') {
                $scope.vm.alerts.push({
                    type: 'danger',
                    msg: 'Houses failed to export!'
                });
            } else {
                $scope.vm.exportFileName = `${response}.xlsx`;
                downloadExcel(response);
            }
        });

    };
    $scope.vm.backupHouses = function () {
        serverServices.backupHouses($rootScope.houses).then(function (response) {
            if (response === 'Request failed') {
                $scope.vm.alerts.push({
                    type: 'danger',
                    msg: 'Backup failed!'
                });
            } else {
                downloadBackup();
            }
        });
    };
    $scope.vm.saveHouses = function (isProg) {
        $localStorage.houses = $rootScope.houses;
        $localStorage.ppmnts = $scope.ppmnts;
        $localStorage.bdlst = $scope.bdlst;

        if (isProg) {
            $scope.vm.alerts.push({
                type: 'success',
                msg: 'Houses were saved!'
            });
        }

    };

    $scope.vm.closeAlert = function (index) {
        $scope.vm.alerts.splice(index, 1);
    };

    $scope.$on("$destroy", function () {
        //TODO: I've cancelled the revoke of the download url if it doesn't give out memory leak issues we can delete this piece of code entirely
        URL.revokeObjectURL($scope.vm.url);
        $scope.vm.url = undefined;
    });

}]);