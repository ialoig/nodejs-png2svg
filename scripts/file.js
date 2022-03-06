const fs = require("fs")
const chalk = require("chalk")
const PNG = require("pngjs").PNG

const readPNG = () => {
	const pngFile = __dirname + "/../src/data/pixel-player.png"
	console.log("\nReading PNG file : ", chalk.blue(pngFile))

	// reading PNG File
	const buffer = fs.readFileSync(pngFile)
	const png = PNG.sync.read(buffer)
	console.log(
		"PNG information: \n " +
		"size: %s x %s,\n " + 
		"byte per pixel (bpp): %s", chalk.blue(png.width), chalk.blue(png.height), chalk.blue(png.bpp))

	return png
}


const writeJSONFile = (data, name) => {
	const fileName = __dirname + "/../src/data/" + name + ".json"
	fs.writeFileSync(fileName, JSON.stringify(data))
	console.log("\n📄 Writed file: %s\n", chalk.blue(fileName))
}


const writeSVGFile = (data, name) => {
	const fileName = __dirname + "/../src/data/" + name + ".svg"
	fs.writeFileSync(fileName, data)
	console.log("\n🖼  Writed SVG file: %s\n", chalk.blue(fileName))
}


module.exports = {
	readPNG,
	writeJSONFile,
	writeSVGFile
}