require! {
  path
  process
  webpack
}

cwd = process.cwd()

npmdir = (x) ->
  path.join(cwd, 'node_modules', x)

npmdir_custom = (x) ->
  path.join(cwd, 'src', 'node_modules_custom', x)


fromcwd = (x) ->
  path.join(cwd, x)

module.exports = {
  #devtool: 'eval-cheap-module-source-map'
  devtool: 'cheap-module-source-map'
  #devtool: 'linked-src'
  #devtool: null
  debug: true
  watch: false
  plugins: [
    # new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    new webpack.optimize.DedupePlugin()
  ]
  module: {
    loaders: [
        {
          test: /\.html$/
          loader: 'html-loader?attrs=false'
        }
        {
          # asset loader
          test: /\.(woff|woff2|ttf|eot)$/,
          loader: 'file-loader?name=[path][name]'
        }
        {
          # image loader
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader:'file-loader?name=[path][name]'
        }
        {
          # html loader
          test: /\.(jpe?g|png|gif|svg)$/i,
          loader:'file-loader?name=[path][name]'
        }
        {
          test: /\.ls$/
          # livescript with embedded jsx
          # need the linked-src option according to
          # https://github.com/appedemic/livescript-loader/issues/10
          loader: 'babel-loader!livescript-loader?map=linked-src'
          include: [fromcwd('src/components_skate')]
          exclude: [
            fromcwd('node_modules')
            fromcwd('bower_components')
          ]
        }
        {
          test: /\.ls$/
          loader: 'livescript-loader'
          include: [fromcwd('src')]
          exclude: [
            fromcwd('src/components_skate')
            fromcwd('node_modules')
            fromcwd('bower_components')
          ]
        }
        {
          test: /\.jsx$/
          loader: 'babel-loader'
          include: [fromcwd('src')]
          exclude: [
            fromcwd('node_modules')
            fromcwd('bower_components')
          ]
        }
    ]
  }
  resolve: {
    moduleDirectories: ['node_modules']
    extensions: [
      ''
      '.jsx'
      '.ls'
      '.js'
    ]
    alias: {
      'zepto': npmdir 'npm-zepto'
      'prelude': npmdir 'prelude-ls'
      'skatejs': npmdir 'skatejs1'
      'jquery-contextmenu': npmdir_custom 'jquery-contextmenu'
      'jquery.isinview': npmdir_custom 'jquery.isinview'
      'jquery.terminal': npmdir_custom 'jquery.terminal'
      'jquery-inview': npmdir_custom 'jquery-inview'
      #'systemjs': fromcwd path.join('jspm_packages', 'system.js')
      #'jspm_config_global_base': fromcwd 'jspm.config.js'
    }
    fallback: [
      fromcwd('src')
    ]
  }
  node: {
    fs: 'empty'
  }
}
