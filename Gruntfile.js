module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'parse/**/*.js', 'test/**/*.js'],
      options: {
        globals: {}
      }
    },
    watch: {},
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
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('serve', ['clean:parse','copy:client','copy:server']);
};