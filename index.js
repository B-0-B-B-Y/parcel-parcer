const fs = require('fs')
const csv = require('csvtojson')
const args = process.argv.slice(2)
const [ filepath, dateFilter ] = args
const birminghamCodes = [/B\d/, /TF/, /DY/, /WV/]
const leedsCodes = [/WF16/, /BD/, /LS/]
const wakefieldCodes = [/^WF1$/, /WF2/, /WF3/, /WF4/, /HD/]

if (args.length != 2) {
    console.log("Please supply exactly 2 arguments to the script, like so ---> 'node index.js [filepathToCSV] [dateToFilterOn]'")
    process.exit(-1)
}

const sortDepots = (filteredParcels) => {
    for (x = 0; x < filteredParcels.length; x++) {        
        if (wakefieldCodes.some(code => filteredParcels[x].postcode.split(' ')[0].match(code))) {
            console.log(filteredParcels[x].postcode)
        }
    }
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