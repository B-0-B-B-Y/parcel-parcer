# Parcel parser
Small node.js script to parse a CSV containing parcel information and filter based on a specified date argument.

# How to run

1) Clone repository and make sure you are at the root of the project
2) Run `npm i`
3) Run `node index.js [path-to-csv] [date-to-filter-on]` . For a more detailed explanation of this, refer to the section below.
4) The output JSON files will be written to a folder called `output`

# More detailed explanation of script usage

**Script usage:**
  `$ > node index.js [path-to-csv-file-here, default csv file located at: data/sample-parcels.csv] [data-to-filter-on-here, format = YYYY-MM-DD]`
  
**Example usage:**
  `$ > node index.js data/sample-parcels.csv 2019-10-20`
