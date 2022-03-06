const chalk = require("chalk")


const decode = (rleRows) => {
	console.log(chalk.white("\nSTART decoding file ..."))

	const svgOpen = '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
	const svgClose = "</svg>"
    
	let rects = ""
	for (let row = 0; row < rleRows.length; row++) {
		const rleRow = rleRows[row] // like : #ffffff32#0000004#ffffff28

		const rectsPerRow = generateRects(row, rleRow)
		rects =  rects.concat(rectsPerRow)
	}

	const svg = svgOpen + rects + svgClose
	return svg
}


const generateRects = (row, rlerow) => {
	if (rlerow.length === 0)
		return

	// split RLE row for the special char
	const rlePixel = rlerow.split("#") // [ '', 'ffffff32', '0000004', 'ffffff28' ]

	if (rlePixel.length === 0)
		return

	let xWidth = 0 // variable to save x axis values; should be incremented by width
	let rects = "" // store all the generated rects

	const regHex = /([a-f\d]{6})/
	for (let i=0; i<rlePixel.length; i++) {

		const pixel = rlePixel[i] // #ffffff64
		const pixelinfo = pixel.split(regHex)
		if (pixelinfo.length === 3) {
            
			const fill = pixelinfo[1]
			const width = parseInt(pixelinfo[2])
			const info = {
				x: xWidth,
				y: row,
				width: width,
				fill: fill
			}

			const rect = getSVGRect(info)
			rects = rects.concat(rect)

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


module.exports = {
	decode
}