const { encode } = require("./encoder")
const { readPNGs, writeJSONFile } = require("./file")


const main = async () => {
	// read and extract png information
	const images = readPNGs()

	for (const image of images) {
		// start RLE encoding
		encode(image)
		writeJSONFile(image.rle, image.name + "-rle")
	}
}



main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})