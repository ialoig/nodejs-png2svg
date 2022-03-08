const getRandom = (min, max) => {
	return Math.floor(Math.random() * (max-min+1) + min )
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
	getRandom,
	rgbToHex
}