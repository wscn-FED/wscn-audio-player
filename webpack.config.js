var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var inlineSvg = require('postcss-inline-svg');
var svgo = require('postcss-svgo');
var path = require('path');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var isProduction = process.argv.indexOf('--production') !== -1;
var config = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    port: 1337,
    contentBase: './'
  },
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:9000',
    './src/js/audio.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'ws-audio-player.js',
    library: 'WSAudioPlayer',
    libraryTarget: 'umd'
  },
  externals: {
    "jquery": {
      root: '$',
      commonjs2: 'jquery',
      commonjs: 'jquery',
      amd: 'jquery'
    }
  },
  module: {
    loaders: [
      {
        test: /\.scss/,
        loader: 'style!css!postcss!sass'
      },
      {
        test: /\.js/,
        loader: 'babel',
        include: /src/,
        exclude: /node_modules/
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'url?limit=50000'
      }
    ]
  },
  sassLoader: {
    sourceMap: true
  },
  postcss: [
    inlineSvg(),
    svgo(),
    autoprefixer({  
      browsers: ['last 3 versions']
    })
  ],
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/index.html'
    }),
    new OpenBrowserPlugin({url: 'http://localhost:1337'})
  ]
}

if (isProduction) {
  config.entry = './src/js/audio.js';
  config.output.filename = 'ws-audio-player.min.js';
  config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}

module.exports = config;
