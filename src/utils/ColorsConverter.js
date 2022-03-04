// https://github.com/catamphetamine/color-space/blob/b940ca709c99048ee9ff3a91b7b66fdb78db72a8/source/index.js


/**
 * Converts RGB color to CIE 1931 XYZ color space.
 * https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz
 * @param  {number[]} hex
 * @return {number[]}
 */
export function rgbToXyz([r, g, b]) {
	[r, g, b] = [r, g, b].map(_ => _ / 255).map(srgbToLinearRgb)
	const X =  0.4124 * r + 0.3576 * g + 0.1805 * b
	const Y =  0.2126 * r + 0.7152 * g + 0.0722 * b
	const Z =  0.0193 * r + 0.1192 * g + 0.9505 * b
	// For some reason, X, Y and Z are multiplied by 100.
	return [X, Y, Z].map(_ => _ * 100)
}

/**
 * Converts RGB color to CIE 1931 XYZ color space.
 * https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz
 * @param  {number[]}
 * @return {Object} an Object representing the color in RGB format
 */
export function xyzToRgb([X, Y, Z]) {
	const r =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z
	const g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z
	const b =  0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z
	const rgb = [r, g, b]
		// Fix out-of-bounds RGB values by clipping those color components.
		// https://photo.stackexchange.com/questions/67990/what-should-i-do-with-negative-values-when-computing-srgb-colors-from-spectra
		.map(_ => Math.min(_, 100))
		.map(_ => Math.max(_, 0))
		.map(_ => _ / 100)
		.map(linearRgbToSrgb)
		.map(_ => Math.round(_ * 255))
	const colorRGB = {
		r: rgb[0],
		g: rgb[1],
		b: rgb[2],
	}
	return colorRGB
}

/**
 * Undoes gamma-correction from an RGB-encoded color.
 * https://en.wikipedia.org/wiki/Gamma_correction
 * https://en.wikipedia.org/wiki/SRGB#Specification_of_the_transformation
 * https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
 * @param  {number}
 * @return {number}
 */
function srgbToLinearRgb(color) {
	// Send this function a decimal sRGB gamma encoded color value
	// between 0.0 and 1.0, and it returns a linearized value.
	if (color <= 0.04045) {
		return color / 12.92
	} else {
		return Math.pow((color + 0.055) / 1.055, 2.4)
	}
}

/**
 * Applies gamma-correction to an RGB-encoded color.
 * https://en.wikipedia.org/wiki/Gamma_correction
 * https://en.wikipedia.org/wiki/SRGB#Specification_of_the_transformation
 * https://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
 * @param  {number}
 * @return {number}
 */
function linearRgbToSrgb(color) {
	if (color <= 0.0031308) {
		return color * 12.92
	} else {
		return 1.055 * Math.pow(color, 0.416) - 0.055
	}
}

/**
 * Converts hex color to RGB.
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param  {string} hex
 * @return {number[]} [rgb]
 */
export function hexToRgb(hex) {
	const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	if (match) {
		match.shift()
		return match.map(_ => parseInt(_, 16))
	}
}

/**
 * Converts RGB color to hex.
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param  {string} hex
 * @return {number[]} [rgb]
 */
export function rgbToHex([r, g, b]) {
	return "#" + rgbComponentToHex(r) + rgbComponentToHex(g) + rgbComponentToHex(b)
}

function rgbComponentToHex(component) {
	const hex = component.toString(16)
	return hex.length === 1 ? "0" + hex : hex
}

/**
 * Converts CIE 1931 XYZ colors to CIE L*a*b*.
 * The conversion formula comes from <http://www.easyrgb.com/en/math.php>.
 * https://github.com/cangoektas/xyz-to-lab/blob/master/src/index.js
 * @param   {number[]} color The CIE 1931 XYZ color to convert which refers to
 *                           the D65/2° standard illuminant.
 * @returns {number[]}       The color in the CIE L*a*b* color space.
 */
// X, Y, Z of a "D65" light source.
// "D65" is a standard 6500K Daylight light source.
// https://en.wikipedia.org/wiki/Illuminant_D65
const D65 = [95.047, 100, 108.883]
export function xyzToLab([x, y, z]) {
	[x, y, z] = [x, y, z].map((v, i) => {
		v = v / D65[i]
		return v > 0.008856 ? Math.pow(v, 1 / 3) : v * 7.787 + 16 / 116
	})
	const l = 116 * y - 16
	const a = 500 * (x - y)
	const b = 200 * (y - z)
	return [l, a, b]
}

/**
 * Converts CIE L*a*b* colors to CIE 1931 XYZ.
 * The conversion formula comes from <http://www.easyrgb.com/en/math.php>.
 * @param   {number[]} color The CIE L*a*b* color to convert.
 * @returns {Object}   The color in the CIE 1931 XYZ color space referring
 *                           to the D65/2° standard illuminant.
 */
export function labToXyz([l, a, b]) {
	let y = (l + 16) / 116
	let x = a / 500 + y
	let z = y - b / 200
	; // This semicolon is required to fix compilation syntax error.
	[x, y, z] = [x, y, z].map((v) => {
		return Math.pow(v, 3) > 0.008856 ? Math.pow(v, 3) : (v - 16 / 116) / 7.787
	})

	let colorXYZ = {
		x: x * D65[0],
		y: y * D65[1],
		z: z * D65[2]
	}

	return colorXYZ
}

/**
 * Converts Lab color space to Luminance-Chroma-Hue color space.
 * http://www.brucelindbloom.com/index.html?Eqn_Lab_to_LCH.html
 * @param  {number[]}
 * @return {number[]}
 */
export function labToLch([l, a, b]) {
	const c = Math.sqrt(a * a + b * b)
	const h = abToHue(a, b)
	return [l, c, h]
}

/**
 * Converts Luminance-Chroma-Hue color space to Lab color space.
 * http://www.brucelindbloom.com/index.html?Eqn_LCH_to_Lab.html
 * @param  {number[]}
 * @return {Object} an object representing the Lab Color 
 */
export function lchToLab([l, c, h]) {
	let colorLab = {
		l: l,
		a: c * Math.cos(h),
		b: c * Math.sin(h)
	}
	return colorLab
}

/**
 * Converts a and b of Lab color space to Hue of LCH color space.
 * https://stackoverflow.com/questions/53733379/conversion-of-cielab-to-cielchab-not-yielding-correct-result
 * @param  {number} a
 * @param  {number} b
 * @return {number}
 */
function abToHue(a, b) {
	if (a >= 0 && b === 0) {
		return 0
	}
	if (a < 0 && b === 0) {
		return 180
	}
	if (a === 0 && b > 0) {
		return 90
	}
	if (a === 0 && b < 0) {
		return 270
	}
	let xBias
	if (a > 0 && b > 0) {
		xBias = 0
	} else if (a < 0) {
		xBias = 180
	} else if (a > 0 && b < 0) {
		xBias = 360
	}
	return radiansToDegrees(Math.atan(b / a)) + xBias
}

function radiansToDegrees(radians) {
	return radians * (180 / Math.PI)
}

function degreesToRadians(degrees) {
	return degrees * Math.PI / 180
}

/**
 * Saturated colors appear brighter to human eye.
 * That's called Helmholtz-Kohlrausch effect.
 * https://en.wikipedia.org/wiki/Helmholtz%E2%80%93Kohlrausch_effect
 * https://www.mikewoodconsulting.com/articles/Protocol%20Summer%202012%20-%20HK%20Effect.pdf
 * Fairchild and Pirrotta came up with a formula to
 * calculate a correction for that effect.
 * "Color Quality of Semiconductor and Conventional Light Sources":
 * https://books.google.ru/books?id=ptDJDQAAQBAJ&pg=PA45&lpg=PA45&dq=fairchild+pirrotta+correction&source=bl&ots=7gXR2MGJs7&sig=ACfU3U3uIHo0ZUdZB_Cz9F9NldKzBix0oQ&hl=ru&sa=X&ved=2ahUKEwi47LGivOvmAhUHEpoKHU_ICkIQ6AEwAXoECAkQAQ#v=onepage&q=fairchild%20pirrotta%20correction&f=false
 * @return {number}
 */
function getLightnessUsingFairchildPirrottaCorrection([l, c, h]) {
	const g = 0.116 * Math.abs(Math.sin(degreesToRadians((h - 90) / 2))) + 0.085
	return l + (2.5 - 0.025 * l) * g * c
}

/**
 * Returns a "perceived" brightness of a color.
 * On a modern CPU it executes in about a couple of nanoseconds.
 * Can be used to display `authorIdColor` tags on comments:
 * to determine what should be the color of a text inside a tag.
 * For example, if `authorIdColor` is bright then the text inside
 * the colored tag should be black, and vice versa.
 * Calculating perceived lightness is far more complex than doing
 * `R + G + B / 3` or alike: first the color is gamma-corrected
 * to convert it from sRGB color space to linear RGB color space,
 * then it's converted to CIE XYZ color space, then to CIE Lab color space,
 * then to CIE LCH color space, and after that Fairchild & Pirrotta
 * liminance correctionis applied to compensate for the Helmholtz-Kohlrausch effect.
 * The result is that the perceived lightness for both `#aaaaaa` gray and
 * `#ff0000` red is `70`. To my taste, perceived background color lightness of
 * `58` should be the threshold for switching between white and black text color.
 * @param  {string} hex
 * @return {number}
 */
export function getPerceivedLightness(hex) {
	return getLightnessUsingFairchildPirrottaCorrection(labToLch(xyzToLab(rgbToXyz(hexToRgb(hex)))))
}


// https://www.w3.org/TR/css-color-4/#oklab-lab-to-predefined
// - Convert Lab to (D50-adapted) XYZ
// - If needed, convert from a D50 whitepoint (used by Lab) to the D65 whitepoint used in sRGB and most other RGB spaces, 
//    with the Bradford transform. prophoto-rgb' does not require this step.
// - Convert from (D65-adapted) CIE XYZ to linear RGB
// - Convert from linear-light RGB to RGB (do gamma encoding)
export const convertToRBG = (color) => {
	const colorLab = lchToLab([color.l, color.c, color.h])
	const colorXYZ = labToXyz([colorLab.l, colorLab.a, colorLab.b])
	const colorRGB = xyzToRgb([colorXYZ.x, colorXYZ.y, colorXYZ.z])
	console.log("[convertToRBG] colorRGB: ", colorRGB)
	return colorRGB
}


export const convertToHex = (colorLCH) => {
	console.log("[convertToHex] converting color: ", colorLCH)
	const colorRGB = convertToRBG(colorLCH)
	const hex =  rgbToHex([colorRGB.r, colorRGB.g, colorRGB.b])
	console.log("[convertToHex] hex: ", hex)
	return hex
}