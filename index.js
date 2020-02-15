const fs = require('fs')
const csv = require('csvtojson')
const axios = require('axios')
const args = process.argv.slice(2)
const [ filepath, dateFilter ] = args
const birminghamCodes = [/B\d/, /TF/, /DY/, /WV/]
const leedsCodes = [/WF16/, /BD/, /LS/]

if (args.length != 2) {
    console.log("Please supply exactly 2 arguments to the script, like so ---> 'node index.js [filepathToCSV] [dateToFilterOn]'")
    process.exit(-1)
}

const sortParcels = async (filteredParcels) => {
    const birminghamParcels = [], leedsParcels = [], wakefieldParcels = []

    for (x = 0; x < filteredParcels.length; x++) {
        const currentParcel = filteredParcels[x]
        const postcodeID = currentParcel.postcode.split(' ')[0]
        const deliveryInformation = await axios.get(`https://us-central1-dpduk-s-test-d1.cloudfunctions.net/parcels/${currentParcel.parcel_number}`,
         { headers: {'Authorization' : `Bearer 04B5BD62-A454-41D0-BEEB-E952D239283E`}
        }).then((result) => {
            return result.data
        })

        currentParcel.route = deliveryInformation.route
        currentParcel.eta = deliveryInformation.eta

        if (birminghamCodes.some(code => postcodeID.match(code))) {
            birminghamParcels.push(currentParcel)
        } else if (leedsCodes.some(code => postcodeID.match(code))) {
            leedsParcels.push(currentParcel)
        } else {
            wakefieldParcels.push(currentParcel)
        }
    }

    const sortedBHParcels = birminghamParcels.sort((a, b) => (a.route > b.route) ? 1 : -1)

    console.log(sortedBHParcels)

    return { birminghamParcels, leedsParcels, wakefieldParcels }
}

const processCSV = (filepath) => {
    csv()
    .fromFile(filepath)
    .then((parcelData) => {
        const filteredParcels = parcelData.filter(parcel => {
            return parcel.delivery_date === dateFilter.toString()
        })

        return sortParcels(filteredParcels)
    })
    .then((sortedParcels) => {
        // console.log(sortedParcels)
    })
}

processCSV(filepath)
