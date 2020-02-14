const fs = require('fs')
const args = process.argv.slice(2)

if (args.length != 2) {
    console.log("Please supply exactly 2 arguments to the script, like so ---> 'node index.js [filepathToCSV] [dateToFilterOn]'")
    process.exit(-1)
}

const filepath = args[0]
const dateFilter = args[1]

const readInCSV = (filepath) => {
    let parcelData

    try {
        parcelData = fs.readFileSync(filepath, 'utf8')
    } catch (error) {
        console.log('The following error occurred: \n\n', error)
        process.exit(error.errno)
    }

    return parcelData
}

readInCSV(filepath)
