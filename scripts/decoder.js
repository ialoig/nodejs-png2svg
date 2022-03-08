const chalk = require("chalk")


const decode = (rleRows) => {
	console.log(chalk.white("\nSTART decoding file ..."))

	const svgOpen = '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
	const svgClose = "</svg>"
    
	let rects = []
	for (let row = 0; row < rleRows.length; row++) {
		const rleRow = rleRows[row] // ex : #ffffff32#0000004#ffffff28

		const rectsPerRow = generateRects(row, rleRow)
		rects.push(rectsPerRow)
	}

	const svg = svgOpen + rects.join("") + svgClose
	return svg
}


const generateRects = (row, rlerow) => {
	if (rlerow.length === 0)
		return

	// split RLE row for the special char
	const rlePixel = rlerow.split("#") // ex: [ '', 'ffffff32', '0000004', 'ffffff28' ]

	if (rlePixel.length === 0)
		return

	let xWidth = 0 // variable to save x axis values; should be incremented by width
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
				y: row,
				width: width,
				fill: fill
			}

			const rect = getSVGRect(info)
			rects.push(rect)

			xWidth += width // update x axis value
		}
	}
	return rects
}


const getSVGRect = (info) => {
	// convert transparency tag into the correct svg value
	const fill = info.fill === "xxxxxx" ? "none" : "#" + info.fill
	const rect = 
        '<rect x="' + info.x + 
        '" y="' + info.y + 
        '" width="' + info.width + 
        '" height="1" shape-rendering="crispEdges"' + 
        ' fill="' + fill + '"/>' + "\n"
	return rect

}


module.exports = {
	decode
}