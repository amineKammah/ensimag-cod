module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: '/home/amine/ensimag-projects/ensimag-cod/app/build',
    filename: 'bundle.js'
  },
   module: {
    rules: [{ 
      test: /\.js$/, 
      exclude: /node_modules/, 
      loader: "babel-loader" 
    }]
  }
};
