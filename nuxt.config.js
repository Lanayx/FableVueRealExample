export default {
  /*
  ** Headers of the page
  */
  head: {
    title: 'someproject',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'someproject' },
      { name: 'google-signin-client_id', content: 'some google id' },

    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ],
    script: [
      { src: 'https://apis.google.com/js/platform.js'},
      { src: 'http://maps.googleapis.com/maps/api/js?some google key'},
    ]
  },
  plugins: [
    '~/plugins/vuetify.js',
    '~/plugins/infiniteScroll.js',
    '~/plugins/customComponents.js',
    { src: '~/plugins/vueHummer.js', ssr: false },
    '~/plugins/storeModule.js',
    '~/api/private.js',
    '~/api/public.js'
  ],
  modules: [
    '@nuxtjs/pwa',
  ],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    transpile: [/^vuetify/],
    babel: {
      plugins: [
        ["transform-imports", {
          "vuetify": {
            "transform": "vuetify/es5/components/${member}",
            "preventFullImport": true
          }
        }]
      ]
    },
    extractCSS: true,
    cssSourceMap: false,
    /*
    ** Run ESLint on save
    */
    extend (config, {isDev}) {
      if (isDev && process.client) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      if (process.server) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/]
          })
        ]
      }
      const vueLoader = config.module.rules.find(r => r.loader === 'vue-loader')
      vueLoader.options.transformToRequire = {
        video: ['src', 'poster'],
        source: 'src',
        img: 'src',
        image: 'xlink:href',
        object: 'src',
        embed: 'src'
      }
    }
  }
}
