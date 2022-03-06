const { decode } = require("./decoder")
const { encode } = require("./encoder")
const { writeJSONFile, writeSVGFile, readPNGs } = require("./file")


const main = async () => {
	// read and extract png information
	const images = readPNGs()

	for (const image of images) {
		// start RLE encoding
		encode(image)
		writeJSONFile(image.rle, image.name + "-rle")
	
		// start decoding and converting in SVG file
		const svg = decode(image.rle)
		writeSVGFile(svg, image.name + "-decoded")
	}
}


main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})