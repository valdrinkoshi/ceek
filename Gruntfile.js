module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'test/**/*.js'],
            options: {
                globals: {}
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            vendor: {
                src: [],
                dest: 'parse/public/scripts/vendor.js',
                options: {
                  require: ['jquery', 'bootstrap', 'react', 'react-bootstrap', 'react-router','tcomb-form'],
                  transform: ['reactify'],
                }
              },
            ceek: {
                src: ['client/scripts/*.js'],
                dest: 'parse/public/scripts/bundle.js',
                options: {
                  transform: ['reactify'],
                  alias: [
                    './client/scripts/app.js:App',
                    './client/scripts/signup.js:SignUp',
                    './client/scripts/user.js:User',
                  ],
                  external: ['react'],
                  browserifyOptions: {
                    debug: true
                  }
                }
              },
        },
        watch: {
            vendor: {
                files: ['Gruntfile.js'],
                tasks: ['default', 'copy:vendor']
            },
            parse: {
                files: ['client/**/*', 'server/**/*'],
                tasks: ['jshint', 'browserify:ceek', 'copy:client', 'copy:server']
            }
        },
        copy: {
            client: {
                expand: true,
                cwd: 'client',
                dest: 'parse/public/',
                src: ['**/*.css', '**/*.html']
            },
            server: {
                expand: true,
                cwd: 'server',
                dest: 'parse/cloud/',
                src: '**/*'
            },
            vendor: {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules/',
                        src: ['bootstrap/dist/css/bootstrap.min.css',
                            'bootstrap/dist/css/bootstrap-theme.min.css'],
                        dest: 'parse/public/css/',
                        flatten: true
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/',
                        src: ['bootstrap/dist/fonts/*'],
                        dest: 'parse/public/fonts/',
                        flatten: true
                    }]
            }
        },
        clean: {
            parse: {
                files: [{
                    dot: true,
                    src: [
                        'parse/cloud/*',
                        'parse/public/*',
                    ]
                }]
            }
        },
        exec: {
            serve: 'cd parse/ && export CEEK_LOCAL=1 && parsedev &',
            deploy: 'cd parse/ && parse deploy'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('default', ['jshint', 'browserify']);
    grunt.registerTask('build', ['clean', 'default', 'copy']);
    grunt.registerTask('serve', ['build', 'exec:serve', 'watch']);
    grunt.registerTask('deploy', ['exec:deploy']);
};