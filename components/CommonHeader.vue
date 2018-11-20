<template>
  <v-toolbar>
    <v-btn flat :to="'/' + lang">someproject</v-btn>
    <v-spacer></v-spacer>
    <v-toolbar-title>
      <template v-if="link">
        <router-link tag="a" :to="link">
          <h1 id="header">{{ title }}</h1>
        </router-link>
      </template>
      <template v-else>
        <h1 id="header">{{ title }}</h1>
      </template>      
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-select id="selLang"
            :items="langs"
            v-model="lang"
            @input="changeLang"
            style="max-width: 60px"
          ></v-select>  
    <v-menu bottom left offset-y v-if="isAuthenticated">
      <v-btn icon slot="activator" class="ml-3 mr-3">
        <v-icon>menu</v-icon>
      </v-btn>
      <v-list>
        <template v-for="route in routes">          
          <v-divider v-if="route.url === 'divider'" :key="route.url"></v-divider>
          <v-list-tile v-else :key="route.url" :to="route.url">          
            <v-list-tile-title>{{ route.title }}</v-list-tile-title>
          </v-list-tile>
         </template>
      </v-list>
    </v-menu>
    <v-btn id="btnEnter" v-else flat :to="'/' + $store.getters.lang +'/enter'">Enter</v-btn>
  </v-toolbar>
</template>

<script>
import {CHANGE_LANG} from '~/common/names'
import {Langs} from '~/common/constants'
export default {
  name: 'commonHeader',
  props: ['title', 'link'],
  data() {
    return {
      msg: 'Your opinion matters',
      langs: Langs,
      lang: this.$store.getters.lang,
      routes: [
        { title: 'Dashboard', url: `/${this.$store.getters.lang}/dashboard` },
        { title: 'Account', url: '/account' },
        { title: 'Suggest', url: '/suggest' },
        { title: '', url: 'divider' },
        { title: 'Logout', url: '/logout' }
      ]
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.gettersAuth.isAuthenticated
    }
  },
  methods: {
    changeLang(val) {
      this.$store.dispatch(CHANGE_LANG, val)
      var params = this.$route.params
      params.lang = val
      this.$router.replace({ name: this.$route.name, params: params })
    }
  }
}
</script>

<style scoped>

</style>