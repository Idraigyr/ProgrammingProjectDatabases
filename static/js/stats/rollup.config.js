export default {
	input: 'src/Stats.js',
	output: [
		{
			format: 'umd',
			name: 'Stats',
			file: 'buildStats/stats.js',
			indent: '\t'
		},
		{
			format: 'es',
			name: 'Stats',
			file: 'buildStats/stats.module.js',
			indent: '\t'
		}
	]
};
