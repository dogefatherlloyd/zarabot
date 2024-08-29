const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  mode: 'development', // Or 'production' based on your environment
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "zlib": require.resolve("browserify-zlib"),
      "assert": require.resolve("assert/"),
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url/")
    }
  },
  plugins: [
    // Ignore any Node.js-specific modules that aren't needed in the browser
    new webpack.IgnorePlugin({
      resourceRegExp: /^child_process$/
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^fs$/
    })
  ]
};