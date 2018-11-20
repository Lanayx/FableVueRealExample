<template>
  <v-container fluid text-xs-center id="start" class="pa-0">
    <v-layout column fill-height>
      <commonHeader title="Test Fable+Vue project"></commonHeader>
      <v-layout>        
        <v-flex xs6>
          <h2>Some questions</h2>     
          <router-link v-for="problem in problems" :key="problem.id" tag="a" class="problemLink"
            :to="$store.getters.problemLink(problem.alias)">{{problem.header}}</router-link>
          <br>
          <video class="video" controls="true" poster="~/assets/poster.jpg"></video>
        </v-flex>
        <v-flex xs6 class="grey darken-4 white--text">
          <h2>Some people</h2>
          <router-link tag="a" :to="`/${$store.getters.lang}/opinion/Someone/your-opinion-header`">Someone</router-link>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import * as PubApi from '~/api/public.js'

export default {
  name: 'start',
  data() {
    return {
      problems: []
    }
  },
  mounted() {
    PubApi.GetTopProblems()
      .then(data => {
        this.problems = data
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  }
}
</script>

<style scoped>
.video {
  width: 50%;
}
.problemLink {
  display: block;
}
</style>