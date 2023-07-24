module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{png,svg,ico,js,webmanifest,css}'
	],
	swDest: 'public/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};