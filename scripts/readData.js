// https://magazine.art21.org/2011/09/13/how-to-create-a-bitmap-image-file-by-hand-without-stencils/
// https://medium.com/sysf/bits-to-bitmaps-a-simple-walkthrough-of-bmp-image-format-765dc6857393
// https://gametuts.org/generating-bitmap-images-on-the-fly-for-canvas-in-javascript/


const fs = require("fs")
const svg = require("svg-parser")
const { bmp_rgb, bmp_rle8 } = require("../src/utils/jsbmp")

async function readFile () {
	const svgFile = __dirname + "/../src/data/swt.svg"
	console.log("SVG file is : ", svgFile)

	if (!fs.existsSync(svgFile)) {
		console.error("Path does not exists. Please check if the path is correct: ", svgFile)
		return
	}

	const buffer = fs.readFileSync(svgFile, (err, data) => {
		if (err) {
			console.log("Error while reading file: ", err)
		}
	})

	const parsed = svg.parse(buffer.toString())
	console.log("svg file parsed: ", parsed)

	let rects = []
	let imageData = {
		width: 64,
		height: 64,
		data: []
	}

	for (let i = 0; i<parsed.children.length; i++) {
		const svgTag = parsed.children[i] // svg tag
		if (!svgTag.tagName === "svg") 
			return
		for (let j = 0; j<svgTag.children.length; j++) {
			const childs = svgTag.children[j]
			if (childs.tagName === "rect") {
				const prop = childs.properties
				if (prop.x && prop.y) {

					// optimization

					// found if there is already a rect with the same x value
					let found = rects.find( (rect) => rect.x === prop.x )

					// if yes, add y axis to the y values of the objct found
					if (found != undefined) {
						found.y.push(prop.y)
						found.fill.push(prop.fill)
					} 
					// if not means it is a new x value; add it as a new object
					else {
						const rect = {
							x: prop.x,
							y: [prop.y],
							fill: [prop.fill]
						}
						rects.push(rect)
					}


					// setting pixels
					const rgb = hexToRgb(prop.fill)
					setPixel(imageData, prop.x, prop.y, rgb[0], rgb[1], rgb[2], 1)
				}
			}
		}
	}

	// console.log("imageData is: ", imageData)
	// console.log("rects found are: ", rects.length)
	// writeImageData(imageData)
	// writeSVGData(rects)
	const bmp = bmp_rgb(64, 64, ["000000"])
	console.log("bmp: ", bmp.toString())
	// 2000x2 pixel line, blue on top and red below
	var bluelineredline = bmp_rle8(2000, 2, [["0000FF", 2000], ["FF0000", 2000]])
	console.log("bluelineredline: ", bluelineredline)

	// 5x1 pixel progression from black to light grey
	// var greys = bmp_rgb(5, 1, ["000000","333333", "666666", "999999", "cccccc"])
	var pixel = bmp_rgb(3, 3, ["000000","333333", "666666", "999999", "cccccc", "999999", "cccccc", "999999", "cccccc"])
	fs.writeFileSync(__dirname + "/../src/data/pixel.bmp", pixel)
	console.log("greys: ", pixel)
}


async function createBitmap () {
	const svgFile = __dirname + "/../src/data/swt.svg"
	console.log("SVG file is : ", svgFile)

	if (!fs.existsSync(svgFile)) {
		console.error("Path does not exists. Please check if the path is correct: ", svgFile)
		return
	}

	const buffer = fs.readFileSync(svgFile, (err, data) => {
		if (err) {
			console.log("Error while reading file: ", err)
		}
	})

	const parsed = svg.parse(buffer.toString())
	console.log("svg file parsed: ", parsed)
	
	const rects = new Map()

	for (let i = 0; i<parsed.children.length; i++) {
		const svgTag = parsed.children[i] // svg tag
		if (!svgTag.tagName === "svg") 
			return
		for (let j = 0; j<svgTag.children.length; j++) {
			const childs = svgTag.children[j]
			if (childs.tagName === "rect") {
				const prop = childs.properties
				if (prop.x && prop.y) {

					const index = prop.x + prop.y * 64
					
					if (rects.has(index)) {
						const rgb = rects.get(index)
					} else {
						const rgb = hexToRgb(prop.fill)
						rects.set(index, rgb.join(""))
					}
				}
			}
		}
	}

	let pixels = []
	const width = 4
	const height = 4
	const num_pixels = width * height
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = x + y * width
			console.log("INDEX: ", index)
			if (Math.round(Math.random()) == 0) {
				const rgb = hexToRgb("#10AA11") //green
				pixels[index] = "FFFFFF"
			}  else {
				pixels[index] = "000000" //red
			}
			break
		}
		break
	}

	console.log("pixels is: ", pixels)
	const bmp = bmp_rgb(width, height, pixels)
	console.log("bmp: ", bmp)

	// 5x1 pixel progression from black to light grey
	// var greys = bmp_rgb(5, 1, ["000000","333333", "666666", "999999", "cccccc"])
	// var pixel = bmp_rgb(3, 3, ["000000","333333", "666666", "999999", "cccccc", "999999", "cccccc", "999999", "cccccc"])
	fs.writeFileSync(__dirname + "/../src/data/pixels.bmp", bmp)
}


function setPixel(imageData, x, y, r, g, b, a){
	const index = (x + y * imageData.width)
	imageData.data[index * 4 + 0] = r
	imageData.data[index * 4 + 1] = g
	imageData.data[index * 4 + 2] = b
	imageData.data[index * 4 + 3] = a
}


/**
 * Converts hex color to RGB.
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param  {string} hex
 * @return {number[]} [rgb]
 */
function hexToRgb(hex) {
	const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	if (match) {
		match.shift()
		return match.map(_ => parseInt(_, 16))
	}
}


const writeImageData = (imageData) => {
	fs.writeFileSync(__dirname + "/../src/data/swtData_imageData.json", JSON.stringify(imageData))
}

const writeSVGData = (rects) => {
	fs.writeFileSync(__dirname + "/../src/data/swtData.json", JSON.stringify(rects))
}


async function main () {
	// readFile()
	createBitmap()
}



main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})