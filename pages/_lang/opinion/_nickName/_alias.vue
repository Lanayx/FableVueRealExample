<template>
  <div>
    <h1 id="viewHeader">{{ header }}</h1>
    <div id="viewBody" v-html="body"></div>
    <!-- Likes bar -->
    <div class="mt-5 body-2" >
      <span v-if="likeResult !== undefined || isMyOpinion" >{{opinion.upLikeCount}}</span>
      <v-btn v-if="likeResult === 1" icon flat dark color="blue"><v-icon>thumb_up</v-icon></v-btn>
      <v-btn v-else icon flat dark @click="addlike(1)" :disabled="isMyOpinion"><v-icon>thumb_up</v-icon></v-btn>
      &nbsp;&nbsp;&nbsp;
      <span v-if="likeResult !== undefined || isMyOpinion">{{opinion.downLikeCount}}</span>
      <v-btn v-if="likeResult === 0" icon flat dark color="blue"><v-icon >thumb_down</v-icon></v-btn>
      <v-btn v-else icon flat dark @click="addlike(0)" :disabled="isMyOpinion"><v-icon >thumb_down</v-icon></v-btn>
    </div>
    <!-- Comments button -->
    <router-link v-if="commentsVisible" :to="$route.path.substring(0, $route.path.length - 9)">Profile</router-link>
    <router-link v-else :to="$route.path +'/comments'">Comments</router-link>
    <nuxt-child />

  </div>
  
</template>

<script>
import marked from 'marked'
import * as PubApi from '~/api/public.js'
import { ADD_LIKE, UPDATE_LIKE, SET_CURRENT_OPINION } from '~/common/names'

export default {
  name: 'opinionView',
  data() {
    return {
      comments: [],
      commentsOpen: false,
      commentsLoaded: false
    }
  },
  mounted() {
  },
  methods: {
    addlike(result) {
      var method = 
        this.likeResult === undefined ? ADD_LIKE : UPDATE_LIKE;
      this.$store.dispatch(method, { opinionId: this.opinion.id, result: result })
        .catch((reason) => {
          console.error(reason)
        })
    }
  },
  computed: {
    likeResult() {
      return this.$store.getters.hasLiked(this.opinion.id)
    },
    isMyOpinion() {
      return this.$store.getters.isMyOpinion(this.opinion.id)
    },
    opinion() {
      return this.$store.getters.currentOpinion
    },
    opinionText() {
      return this.opinion.opinionTexts
        ? this.opinion.opinionTexts.find(o => o.locale === this.$store.getters.lang)
        : ''
    },
    nativeOpinion() {
      return (this.opinionText.native || !this.opinion.opinionTexts)
        ? null
        : this.opinion.opinionTexts.find(o => o.native)
    },
    header() {
      return this.opinionText.header
    },
    body() {
      return marked(this.opinionText.body || '', { sanitize: true })
    },
    commentsVisible() {
      return this.$store.gettersComment.commentsVisible
    }
  },
  fetch({ store, route }) {
    let currentOpinion = store.getters.currentOpinion
    let opinionTask =
      currentOpinion && (currentOpinion.alias === route.params.alias)
        ? Promise.resolve(currentOpinion)
        : PubApi.GetOpinion(route.params.alias, route.params.nickName)
    return opinionTask
      .then(data => {
        data.alias = route.params.alias
        store.dispatch(SET_CURRENT_OPINION, data)
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  }
}
</script>

<style scoped>
</style>