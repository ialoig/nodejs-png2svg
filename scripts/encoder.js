const chalk = require("chalk")

const encode = (image) => {
	const { name, category, width, height, data } = image
	console.log(chalk.white("\nSTART encoding file: "), chalk.blue(name))
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
			const a = data[idx + 3]

			const hex = rgbToHex([r, g, b, a])

			if (prevHex === undefined ) {
				prevHex = hex
			}

			if (prevHex === hex) {
				count += 1 // increment number of pixel
			} else {
				const row = prevHex + count // define the previous rle string value 
				rleEncodedRows[y] = rleEncodedRows[y] === undefined ? row : rleEncodedRows[y] + row // save the previous rle value into array of rows
				prevHex = hex // update previous hexadecimal with actual
				count = 1 // reset counter
			}
			if (x === width - 1) {
				const row = hex + count // define the rle string value
				rleEncodedRows[y] = rleEncodedRows[y] === undefined ? row : rleEncodedRows[y] + row // insert the row into array of rows
			}
		}
	}
	console.log(chalk.white("File is encoded! size: "), chalk.blue(rleEncodedRows.length))

	// return an image data with the run-length encoding
	const imageData = {
		name: name,
		category: category,
		width: width,
		height: height,
		rle: rleEncodedRows
	}
	return imageData
}


/**
 * Converts RGB color to hex.
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param  {string} hex
 * @return {number[]} [rgb]
 */
function rgbToHex([r, g, b, a]) {
	// color is transparent; return a fake value
	if (a === 0) {
		return "#xxxxxx"
	}
	return "#" + rgbComponentToHex(r) + rgbComponentToHex(g) + rgbComponentToHex(b)
}

function rgbComponentToHex(component) {
	const hex = component.toString(16)
	return hex.length === 1 ? "0" + hex : hex
}



module.exports = {
	encode
}