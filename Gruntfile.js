module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'client/**/*.js', 'test/**/*.js'],
      options: {
        globals: {}
      }
    },
    watch: {
      parse: {
        files: ['Gruntfile.js', 'client/**/*','server/**/*'],
        tasks: ['parse-copy']
      }
    },
    copy: {
      client: {
        expand: true,
        cwd: 'client',
        dest: 'parse/public/',
        src: '**/*'
      },
      server: {
        expand: true,
        cwd: 'server',
        dest: 'parse/cloud/',
        src: '**/*'
      },
      vendor: { 
        files: [{
          expand: true,
          cwd: 'node_modules/',
          src: ['react-bootstrap/dist/react-bootstrap.min.js',
            'react-router/umd/ReactRouter.min.js',
            'bootstrap/dist/js/bootstrap.min.js'],
          dest: 'parse/public/lib/',
          flatten: true
        },
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
      serve: 'cd parse/ && parsedev &',
      deploy: 'cd parse/ && parse deploy'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-exec');


  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('parse-copy',['copy:client','copy:vendor', 'copy:server']);
  grunt.registerTask('serve', ['clean:parse','parse-copy', 'exec:serve', 'watch:parse']);
};