const { decode } = require("./decoder")
const { encode } = require("./encoder")
const { writeJSONFile, writeSVGFile, readPNG } = require("./file")


const main = async () => {
	
	// read and extract png information
	const png = readPNG()
    
	// start RLE encoding
	const rleRows = encode(png)
	writeJSONFile(rleRows, "rle")

	// start decoding and converting in SVG file
	const svg = decode(rleRows)
	writeSVGFile(svg, "rle-svg")
}


main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})