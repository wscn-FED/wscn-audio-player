const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const publicPath = '/'

module.exports = function(env = {}) {
  console.log('****************')
  console.log('env config: ', env)
  console.log('****************')
  return {
    entry: {
      vendor: './src/vendor',
      index: './src/index'
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[id].js',
      publicPath: publicPath
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                root: resolve(__dirname, 'src'),
                attr: ['img:src', 'link:href']
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },

        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery'
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
      new webpack.NamedModulesPlugin()
    ],
    resolve: {
      alias: {
        jquery: resolve(__dirname, 'node_modules/jquery/dist/jquery.min.js'),
        '~': resolve(__dirname, 'src')
      }
    },
    devServer: {
      port: 9000
    }
  }
}
