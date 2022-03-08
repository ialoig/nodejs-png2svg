const { encode } = require("./encoder")
const { readPNGs, writeJSONFile } = require("./file")


const main = async () => {
	// read and extract png information
	const images = readPNGs()
	for (const image of images) {
		// start RLE encoding
		const imageData = encode(image)

		writeJSONFile(imageData.rle, imageData.name + "-rle")
	}
}



main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})