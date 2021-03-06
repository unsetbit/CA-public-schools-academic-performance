var pkg = require('./package.json');

module.exports = function(grunt){
	grunt.initConfig({
		pkg: pkg,

		clean: { dist: ['dist'] },

		browserify: {
			dist: { 
				files: { 'dist/<%= pkg.name %>.js': ['src/js/module.js']	}
			},
			dev: {
				files: { 'dist/<%= pkg.name %>.js': ['src/js/module.js'] },
				options: {	
					bundleOptions: { 
						//debug: true,
						standalone: '<%= pkg.name %>'
					} 
				}
			},
			options: {
				bundleOptions: { standalone: '<%= pkg.name %>' }
			}
		},
		
		uglify: {
			dist: {	files: { 'dist/<%= pkg.name %>.js': ['dist/<%= pkg.name %>.js']	} }
		},

		watch: {
			devJS: {
				files: ['src/js/**'],
				tasks: ['browserify:dev', 'jshint:dev']
			},
			devCSS: {
				files: ['src/css/**'],
				tasks: ['compass', 'concat']
			}
		},

		compass: {
			dist: {
				options: { sassDir: 'src/css', cssDir: 'dist' }
			}
		},

		concat: {
			dist: {
				src: [
					'bower_components/angular-parallel-coordinates/dist/angular-parallel-coordinates.css',
					'dist/<%= pkg.name %>.css'
				],
				dest: 'dist/<%= pkg.name %>.css'
			}
		},

		cssmin: {
			dist: {
				files: { 'dist/<%= pkg.name %>.css' : ['dist/<%= pkg.name %>.css'] }
			}
		},

		jshint: {
			dev: {
				options: { force: true },
				files: { src: ["src/js/**.js"]	}
			},

			dist: {
				files: { src: ["src/js/**.js"]	}
			},

			options: {
				jshintrc: '.jshintrc'
			}
		},

		jasmine: {
			test: {
				src: 'dist/<%= pkg.name %>.js',
				options: {
					specs: 'test/**Spec.js',
					helpers: 'test/**Helper.js'
				}
			}
		},

		connect: {
			server: {
				options: { port: 8000, base: '.' }
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-browserify');
	
	grunt.registerTask('dev', [
		'clean',
		'jasmine',
		'browserify:dev',
		'compass',
		'concat',
		'jshint:dev',
		'connect',
		'watch'
	]);

	grunt.registerTask('dist', [
		'jshint:dist',
		'clean',
		'browserify:dist',
		'uglify',
		'jasmine',
		'compass',
		'concat',
		'cssmin'
	]);

	grunt.registerTask('default', 'dist');

};