const { encode } = require("./encoder")
const { readPNG, writeJSONFile } = require("./file")


const main = async () => {
	// read and extract png information
	const png = readPNG()

	// start RLE encoding
	const rleRows = encode(png)
	writeJSONFile(rleRows, "rle")
}



main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})