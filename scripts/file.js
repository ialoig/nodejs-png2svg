const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const PNG = require("pngjs").PNG

// folder directories
const pathDir = path.join(__dirname, "../src/data")
const encodeDir = path.join(pathDir, "encode")
const exportDir = path.join(pathDir, "export")



const readPNGs = () => {
	let images = []
	const files = fs.readdirSync(path.join(pathDir, "images"))
	for (const file of files ) {
		// reading PNG File
		const fileName = path.join(pathDir, "images", file)
		console.log("\nReading PNG file : ", chalk.blue(fileName))
		const buffer = fs.readFileSync(fileName)
		const png = PNG.sync.read(buffer)

		const imageData = {
			name: file.replace(/\.png$/, ""),
			width: png.width,
			height: png.height,
			data: png.data,
			rle: []
		}

		console.log(
			"PNG information: \n " +
				"size: %s x %s,\n " + 
				"byte per pixel (bpp): %s", chalk.blue(png.width), chalk.blue(png.height), chalk.blue(png.bpp))
		images.push(imageData)
	}
	
	return images
}


const writeJSONFile = (data, name) => {
	const fileName = path.join(encodeDir, name + ".json")
	fs.writeFileSync(fileName, JSON.stringify(data))
	console.log("\n📄 Writed file: %s\n", chalk.blue(fileName))
}


const writeSVGFile = (data, name) => {
	const fileName = path.join(exportDir, name + ".svg")
	fs.writeFileSync(fileName, data)
	console.log("\n🖼  Writed SVG file: %s\n", chalk.blue(fileName))
}


module.exports = {
	readPNGs,
	writeJSONFile,
	writeSVGFile
}