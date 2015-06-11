var webpack = require('webpack')
var path = require('path')
var src = path.join(__dirname, 'public', 'src')
var dist = path.join(__dirname, 'public', 'dist')

var isProd = process.env.NODE_ENV !== 'development'

module.exports = {
    entry: path.join(src, 'entry.js'),
    output: {
        path: dist,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            {
              test: /\.html$/,
              name: 'mandrillTemplates',
              loader: 'raw!html-minify'
            }
        ]
    },
    debug: isProd,
    devtool: 'source-map',
}
