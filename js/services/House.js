myApp.factory('House', function($rootScope, $filter) {

    const bankRegex = /U\.?S\.?\sBANK|WELLS\sFARGO|DITECH\sFINANCIAL/gi;
    const taxLienRegex = /LIEN/gi;

    function HouseSetInstance(listing, isPP, isFC, isDuplicate) {

        this.isPP = isPP;
        this.auctionNumber = listing[13];
        this.docketNumber = listing[0];
        this.attorneyName = listing[1];
        this.plaintiffName = listing[2];
        this.defendantName = listing[14];
        this.saleType = listing[3] && listing[3].match(taxLienRegex) ? "T" : "M";
        this.saleDate = listing[4];
        this.saleStatus = listing[7];
        this.ppDate = listing[8];
        this.costTax = listing[5].replace(new RegExp(" ", 'g'), "");
        this.cost = listing[6].replace(new RegExp(" ", 'g'), "");
        this.reasonForPP = listing[9];
        this.checks = {
            svs: listing[10],
            "3129": listing[11],
            ok: listing[12]
        };
        this.municipality = listing[15].replace("Municipality: ", "");
        this.address = listing[16].replace(new RegExp(",", 'g'),"");
        this.isDuplicate = isDuplicate;
        this.isFC = isFC;
        this.isBank = this.plaintiffName.match(bankRegex) ? true : false;
        let lawFirmMatches =  this.attorneyName.replace(new RegExp(',', 'g'), '').match($rootScope.lawFirmsRegex);
        if (!_.isEmpty(lawFirmMatches) && _.isArray(lawFirmMatches)) {
            if ($rootScope.lawFirmsIndex.hasOwnProperty(lawFirmMatches[0])) {
                this.firmName = $rootScope.lawFirms[$rootScope.lawFirmsIndex[lawFirmMatches[0]]]["Firm details"];
                this.contactEmail = $rootScope.lawFirms[$rootScope.lawFirmsIndex[lawFirmMatches[0]]]["Firm Remarks"];
            }
        }
        this.judgment = $rootScope.judgments[this.docketNumber] ? $rootScope.judgments[this.docketNumber] : '';
    }
    function HouseSetInstanceNoChecks(listing, isPP, isFC, isDuplicate) {

        this.isPP = isPP;
        this.auctionNumber = listing[listing.length - 4];
        this.docketNumber = listing[0];
        this.attorneyName = listing[1];
        this.plaintiffName = listing[2];
        this.defendantName = listing[listing.length - 3];
        this.saleType = listing[3] && listing[3].match(taxLienRegex) ? "T" : "M";
        this.saleDate = listing[4];
        this.saleStatus = listing[7];
        this.ppDate = "";
        this.costTax = listing[5].replace(new RegExp(" ", 'g'), "");
        this.cost = listing[6].replace(new RegExp(" ", 'g'), "");
        this.reasonForPP = isPP ? listing[9] : "";
        this.checks = {
            svs: 'X',
            "3129": 'X',
            ok: 'X'
        };
        this.municipality = listing[listing.length - 2].replace("Municipality: ", "");
        this.address = listing[listing.length - 1].replace(new RegExp(",", 'g'),"");
        this.isDuplicate = isDuplicate;
        this.isFC = isFC;
        this.isBank = this.plaintiffName.match(bankRegex) ? true : false;
        let lawFirmMatches =  this.attorneyName.replace(new RegExp(',', 'g'), '').match($rootScope.lawFirmsRegex);
        if (!_.isEmpty(lawFirmMatches) && _.isArray(lawFirmMatches)) {
            if ($rootScope.lawFirmsIndex.hasOwnProperty(lawFirmMatches[0])) {
                this.firmName = $rootScope.lawFirms[$rootScope.lawFirmsIndex[lawFirmMatches[0]]]["Firm details"];
                this.contactEmail = $rootScope.lawFirms[$rootScope.lawFirmsIndex[lawFirmMatches[0]]]["Firm Remarks"];
            }
        }
        this.judgment = $rootScope.judgments[this.docketNumber] ? $rootScope.judgments[this.docketNumber] : '';

    }

    return {
        createNew: function(listing, isPP, isFC, isDuplicate) {

            if (listing.length >= 17) {
                return new HouseSetInstance(listing, isPP, isFC, isDuplicate);
            }
            else {
                return new HouseSetInstanceNoChecks(listing, isPP, isFC, isDuplicate);
            }
        }
    };

});