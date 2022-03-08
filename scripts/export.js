const { decode } = require("./decoder")
const { encode } = require("./encoder")
const { writeJSONFile, writeSVGFile, readPNGs } = require("./file")


const main = async () => {
	// read and extract png information
	const images = readPNGs()
	for (const image of images) {
		// start RLE encoding
		const imageData = encode(image)
		writeJSONFile(imageData.rle, imageData.name + "-rle")
	
		// start decoding and converting in SVG file
		const svg = decode(imageData.rle)
		writeSVGFile(svg, imageData.name + "-decoded")
	}
}


main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})