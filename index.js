const fs = require('fs')
const csv = require('csvtojson')
const args = process.argv.slice(2)
const [ filepath, dateFilter ] = args
let birminghamParcels, leedsParcels, wakefieldParcels
let birminghamRegex = '(B)+'

if (args.length != 2) {
    console.log("Please supply exactly 2 arguments to the script, like so ---> 'node index.js [filepathToCSV] [dateToFilterOn]'")
    process.exit(-1)
}

const filterByPostcode = (parcelData) => {
    parcelData.forEach(parcel => {
        birminghamParcels = parcel.postcode.match(birminghamRegex)
    })

    console.log(birminghamParcels)
}

const sortDepots = (filteredParcels) => {
    // const birminghamParcels = filteredParcels.filter(parcel)
    
    filterByPostcode(filteredParcels)
}

const processCSV = (filepath) => {
    csv()
    .fromFile(filepath)
    .then((parcelData) => {
        const filteredParcels = parcelData.filter(parcel => {
            return parcel.delivery_date === dateFilter.toString()
        })

        sortDepots(filteredParcels)
    })
}

processCSV(filepath)