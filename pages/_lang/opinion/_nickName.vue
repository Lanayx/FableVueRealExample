<template>
  <v-container fluid text-xs-center id="opinion" class="pa-0">
    <v-layout column fill-height>  
      <commonHeader :title="problem.header" :link="$store.getters.problemLink(problem.alias)"></commonHeader>
      <v-layout>    
        <v-flex xs6>
          <opinionProfile :profile="$store.getters.currentProfile" v-show="!commentsVisible"></opinionProfile>
          <opinionComments v-if="commentsVisible"></opinionComments>
        </v-flex>
        <v-flex xs6 class="grey darken-4 white--text px-5 py-2" >
          <nuxt-child :key="$route.params.alias"/>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import * as PubApi from '~/api/public.js'
import { SET_CURRENT_PROFILE } from '~/common/names'
export default {
  name: 'userOpinion',
  data() {
    return {
    }
  },
  computed: {
    commentsVisible() {
      return this.$store.gettersComment.commentsVisible
    },
    problem() {
      return this.$store.getters.currentOpinion.problem
    }
  },
  fetch({ store, route }) {
    let currentProfile = store.getters.currentProfile
    let profileTask =
      currentProfile && (currentProfile.nickName === route.params.nickName)
        ? Promise.resolve(currentProfile)
        : PubApi.GetUserProfile(route.params.nickName)
    return profileTask
      .then(data => {
        store.dispatch(SET_CURRENT_PROFILE, data)
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  }
}
</script>
