module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* <%= pkg.title || pkg.name %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;\n' +
            '* Last Modified: <%= grunt.template.today() %>\n' +
            '*/\n',
        // Task configuration.
        concat: {
            options: {
                separator: '\n',
                banner: '<%= banner %>'
            },
            dist: {
                src: [
                    'src/**/*.js'
                ],
                dest: 'dist/leaflet-ng.js'
            }
        },
        uglify: {
            options: {
                mangle: true,
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/leaflet-ng.min.js'
            }
        },

        watch: {
            js: {
                files: [
                    'src/**/*.js'
                ],
                tasks: ['concat', 'uglify']
            },
            all: {
                files: ['Gruntfile.js', 'package.json'],
                tasks: ['concat', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);

};