/**
 * This script is created as part of a techincal challenge. In summary, it takes in
 * a CSV file and a date to filter on as 2 arguments, and using the information from
 * the CSV, filter the parcels contained based on the date specified, and write out
 * a series of JSON files for different locations where parcels are grouped by route
 * code number and sorted by delivery ETA times.
 * 
 * Script usage:
 * $ > node index.js [path-to-csv-file-here, default csv file located at: data/sample-parcels.csv] [data-to-filter-on-here, format = YYYY-MM-DD]
 * 
 * Example usage:
 * $ > node index.js data/sample-parcels.csv 2019-10-20
 * 
 * Author: Bob Naydenov, bob.naydenov@protonmail.ch
 * Date: 16/02/2020
 */

const fs = require('fs')
const csv = require('csvtojson')
const axios = require('axios')
const _ = require('underscore')
const args = process.argv.slice(2)
const [ filepath, dateFilter ] = args
const birminghamCodes = [/B\d/, /TF/, /DY/, /WV/]
const leedsCodes = [/WF16/, /BD/, /LS/]

// Make sure exactly 2 arguments are supplied to the script else terminate script execution
if (args.length != 2) {
    console.log("Please supply exactly 2 arguments to the script, like so ---> 'node index.js [filepathToCSV] [dateToFilterOn]'")
    process.exit(-1)
}

/**
 * This function takes the date filtered parcels and produces a set of objects
 * which contain parcels for different locations grouped by route code and sorted
 * in ascending order by delivery estimated time
 * @param Object filteredParcels
 */
const sortParcels = async (filteredParcels) => {
    const birminghamParcels = [], leedsParcels = [], wakefieldParcels = []

    for (x = 0; x < filteredParcels.length; x++) {
        const currentParcel = filteredParcels[x]
        const postcodeID = currentParcel.postcode.split(' ')[0]
        const deliveryInformation = await axios.get(`https://us-central1-dpduk-s-test-d1.cloudfunctions.net/parcels/${currentParcel.parcel_number}`,
         { headers: {'Authorization' : `Bearer 04B5BD62-A454-41D0-BEEB-E952D239283E`} //Note: Normally these types of keys would be stored elsewhere for obvious security reasons
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

    const sortedBirminghamParcels = _.groupBy(_.sortBy(birminghamParcels, 'eta'), 'route')
    const sortedLeedsParcels = _.groupBy(_.sortBy(leedsParcels, 'eta'), 'route')
    const sortedWakefieldParcels = _.groupBy(_.sortBy(wakefieldParcels, 'eta'), 'route')

    return { sortedBirminghamParcels, sortedLeedsParcels, sortedWakefieldParcels }
}

/**
 * This is the main function which runs through all the processes from reading in the CSV file
 * to producing the final output JSON files with all the grouped and sorted parcels. The order
 * of the processes that occur here is:
 * 1) Use csvtojson to read in all parcels from the csv and create the initial JSON object to work with
 * 2) Filter the object to only contain parcels matching the date specified as an argument in the CLI
 * 3) Pass this object to the sorting function sortParcels() which returns the parcels split by
 *    location, grouped by route number and sorted in an ascending order by delivery ETA
 * 4) Create output directory if it doesn't already exist
 * 5) Write out each location as a json file with all the relevant, ready-sorted parcels
 * @param String filepath 
 */
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
        const outputDir = './output'
        const locations = Object.keys(sortedParcels)
        const outputFiles = locations.map(locationName => ({[locationName] : sortedParcels[locationName]}))
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir)
        }

        outputFiles.forEach((location, index) => {
            fs.writeFile(`${outputDir}/${locations[index]}.json`, JSON.stringify(location, null, 4), (err) => {
                if (err) {
                    console.error(err)
                    process.exit(error.errno)
                }
            })
        })
    })
}

processCSV(filepath)
