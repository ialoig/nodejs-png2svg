const fs = require("fs")
const PNG = require("pngjs").PNG


async function main () {
	const pngFile = __dirname + "/../src/data/pixel-player.png"
	console.log("PNG file is : ", pngFile)

	const buffer = fs.readFileSync(pngFile)
	const png = PNG.sync.read(buffer)
	// writePngData(png.data)

	const rleRows = rle(png)
	console.log("rleRows: ", rleRows)
	writeRLEData(rleRows)
	
}


const rle = (png) => {
	const { width, height, data } = png
	let rleEncodedRows = []
	for (let y = 0; y < height; y++) {
		let count = 0
		let prevHex
		for (let x = 0; x < width; x++) {
			let idx = (width * y + x) << 2
				
			// rgb values
			const r = data[idx]
			const g = data[idx + 1]
			const b = data[idx + 2]
			const hex = rgbToHex([r, g, b])
			console.log("idx:", idx, "hex:", hex)

			if (x === 0) {
				prevHex = hex
			}

			if (prevHex === hex) {
				count += 1 // increment number of pixel
			} else {
				const row = "$" + prevHex + count // define the previous rle string value 
				rleEncodedRows[y] = rleEncodedRows[y] === undefined ? row : rleEncodedRows[y] + row // save the previous rle value into array of rows
				console.log("RLE:", row)
				prevHex = hex // update previous hexadecimal with actual
				count = 1 // reset counter
			}
			if (x === width - 1) {
				const row = "$" + hex + count // define the rle string value
				rleEncodedRows[y] = rleEncodedRows[y] === undefined ? row : rleEncodedRows[y] + row // insert the row into array of rows
				console.log("RLE:", row)
			}
		}
	}
	return rleEncodedRows
}



const writeRLEData = (rle) => {
	fs.writeFileSync(__dirname + "/../src/data/swtData_rle.json", rle.join(""))
}

/**
 * Converts RGB color to hex.
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param  {string} hex
 * @return {number[]} [rgb]
 */
function rgbToHex([r, g, b]) {
	return "#" + rgbComponentToHex(r) + rgbComponentToHex(g) + rgbComponentToHex(b)
}

function rgbComponentToHex(component) {
	const hex = component.toString(16)
	return hex.length === 1 ? "0" + hex : hex
}



main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})