const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const PNG = require("pngjs").PNG
const { getRandom } = require("../src/utils/utils")
const { encode } = require("./encoder")
const { writeJSONFile, writeSVGFile } = require("./file")


// folder directories
const pathDir = path.join(__dirname, "../src/data")

// store all the encoded images
const encodedImages = new Map()

const readPNGs = () => {
	let images = []
	
	const directories = ["0-bodies", "1-hair", "2-shirts"]
	for (const directory of directories) {
		const fullPath = path.join(pathDir, "images", directory)
		const files = fs.readdirSync(fullPath)
		for (const file of files ) {
			// reading PNG File
			const fileName = path.join(fullPath, file)
			console.log("\nReading PNG file : ", chalk.blue(fileName))
			const buffer = fs.readFileSync(fileName)
			const png = PNG.sync.read(buffer)
	
			const imageData = {
				name: file.replace(/\.png$/, ""),
				category: directory,
				width: png.width,
				height: png.height,
				data: png.data
			}
	
			console.log(
				"PNG information: \n " +
					"size: %s x %s,\n " + 
					"byte per pixel (bpp): %s", chalk.blue(png.width), chalk.blue(png.height), chalk.blue(png.bpp))
			images.push(imageData)
		}
	}
	
	console.log("\nEND Reading, images are: ", chalk.blue(images.length))
	return images
}


const composeImage = () => {
	let rects = []
	for (const [cat, imageData] of encodedImages) {
		const index = getRandom(0, imageData.length-1)
		const image = imageData[index]
		console.log("category: %s, index: %s, image: %s", cat, index, image.name)

		// decode rle encoding and generate rects
		decode(image, rects)

	}

	// generate svg image
	if (rects.length > 0) {
		const svg = generateSVG(rects)
		writeSVGFile(svg, "composed-image")
	}
}



const decode = (image, rects) => {
	console.log(chalk.white("\nSTART decoding file ..."))

	const { width, height } = image
	const rleRows = image.rle
	for (let row = 0; row < rleRows.length; row++) {
		const rleRow = rleRows[row] // ex : #ffffff32#0000004#ffffff28

		const rectsPerRow = generateRects(row, rleRow, width, height)
		rects.push(rectsPerRow)
	}
}



const generateRects = (row, rlerow, width, height) => {
	if (rlerow.length === 0)
		return

	// split RLE row for the special char
	const rlePixel = rlerow.split("#") // ex: [ '', 'ffffff32', '0000004', 'ffffff28' ]

	if (rlePixel.length === 0)
		return

	let xWidth = (64 / 2 ) - (width / 2) // variable to save x axis values; should be incremented by width
	let yHeight = (64 / 2 ) - (Math.round(height) / 2) // variable to save starting y axis value
	let rects = [] // store all the generated rects

	const regHex = /([a-x\d]{6})/
	for (let i=0; i<rlePixel.length; i++) {

		const pixel = rlePixel[i] // ex: ffffff64
		const pixelinfo = pixel?.split(regHex)
		if (pixelinfo.length === 3) {
            
			const fill = pixelinfo[1]
			const width = parseInt(pixelinfo[2])
			const info = {
				x: xWidth,
				y: row + yHeight,
				width: width,
				fill: fill
			}

			// skip if transparency is 0
			if (info.fill != "xxxxxx") {
				const rect = getSVGRect(info)
				rects.push(rect)
			}

			xWidth += width // update x axis value
		}
	}
	return rects
}



const getSVGRect = (info) => {
	const rect = 
        '<rect x="' + info.x + 
        '" y="' + info.y + 
        '" width="' + info.width + 
        '" height="1" shape-rendering="crispEdges"' + 
        ' fill="#' + info.fill + '"/>' + "\n"
	return rect

}

const generateSVG = (rects) => {

	const svgOpen = '<svg width="64" height="64" viewBox="0 0 64 64" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">\n'
	const bg = '<rect width="100%" height="100%" fill="#ffffff"/>\n'
	const svgClose = "</svg>"

	const svg = svgOpen + bg + rects.join("") + svgClose
	return svg
}

const main = async () => {

	// read and extract png information
	const images = readPNGs()

	for (const image of images) {
		// start RLE encoding
		const imageData = encode(image)
		// writeJSONFile(imageData.rle, imageData.name + "-rle")
	
		// start decoding and converting in SVG file
		// const svg = decode(imageData.rle)
		// writeSVGFile(svg, imageData.name + "-decoded")

		if (encodedImages.has(imageData.category)) {
			let imagesData = encodedImages.get(imageData.category)
			imagesData.push(imageData)
			encodedImages.set(imageData.category, imagesData)
		} else {
			encodedImages.set(imageData.category, [imageData])
		}
	}

	if (encodedImages.length > 0)
		writeJSONFile(...encodedImages.entries(), "encodedImages")

	composeImage()
}


main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})