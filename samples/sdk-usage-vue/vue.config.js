module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /.html$/,
          loader: 'vue-template-loader',
          exclude: /index.html/,
          options: {
            transformAssetUrls: {
              img: 'src'
            }
          }
        }
      ]
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.common",
      },
    }
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      }
    },
  },
  devServer: {
    disableHostCheck: true
  },
  productionSourceMap: false
}
