module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/*.js',
      'test/*.js'
    ],
    exclude: [
    ],
    preprocessors: {
        'src/*.js': ['rollup'],
        'test/*.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [require('rollup-plugin-babel')()],
      output: {
          format: 'iife', // Helps prevent naming collisions.
          name: 'Test', // Required for 'iife' format.
          sourcemap: 'inline', // Sensible for testing.
      },
    },
    plugins: [
        require('karma-rollup-preprocessor'),
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-spec-reporter'),
        require('karma-jasmine-html-reporter')
    ],
    reporters: ['spec','kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    client: {
       clearContext: false
    },

    singleRun: false,
    concurrency: Infinity,
  })
}
