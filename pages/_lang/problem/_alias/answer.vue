<template>
  <v-container fluid text-xs-center id="answer" class="pa-0">
    <v-layout column fill-height class="layoutContainer">
      <commonHeader :title="problem.header"></commonHeader>
      <v-layout>     
        <v-flex xs6>
            <v-btn id="btnAnswerYes" flat light @click="clickYes">Yes</v-btn>
            <infinite-scroll :data="yesOpinions" :loadStep="loadMoreYesOpinions" class="wrapInfinite">
              <div v-for="(item,i) in yesOpinions" :key="i" class="mt-1 mb-1">              
                <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${item.nickName}/${item.opinionAlias}`">{{item.opinionHeader}}</router-link>
              </div>
            </infinite-scroll>   
        </v-flex>
        <v-flex xs6 class="grey darken-4 white--text">
            <v-btn id="btnAnswerNo" flat dark @click="clickNo">No</v-btn>
            <infinite-scroll :data="noOpinions" :loadStep="loadMoreNoOpinions" class="wrapInfinite">
              <div v-for="(item,i) in noOpinions" :key="i" class="mt-1 mb-1">              
                <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${item.nickName}/${item.opinionAlias}`">{{item.opinionHeader}}</router-link>
              </div>
            </infinite-scroll>  
        </v-flex>
        <img v-if="problem.imageName" :src="(staticUrl+`/problem/${problem.id}/${imageName}-500x250.${imageExtension}`)" class="problemImage">
      </v-layout>
    </v-layout>
  </v-container>
   
</template>

<script>
import * as PubApi from '~/api/public.js'
import { VOTE, SET_CURRENT_PROBLEM } from '~/common/names'
import * as Const from '~/common/constants'

var addVote = function(result) {
  this.$store.dispatch(VOTE, { problem: this.problem, result: result })
    .then((str) => {
      setTimeout(() => {
        this.$router.push(
          `/${this.$store.getters.lang}/problem/${this.$route.params.alias}`
        )
      }, 1000)
    })
}

export default {
  name: 'answer',
  data() {
    return {
      problem: {},
      yesOpinions: [],
      noOpinions: [],
      staticUrl: Const.StaticUrl
    }
  },
  mounted() {
    this.problem = this.$store.getters.currentProblem

    Promise.all([
      PubApi.GetProblemOpinions(this.problem.id, 1)
        .then(data => {
          this.yesOpinions = data
        }),
      PubApi.GetProblemOpinions(this.problem.id, 0)
        .then(data => {
          this.noOpinions = data
        })]
    ).catch(error => {
      console.log('Request failed', error)
    })
  },
  methods: {
    clickYes() {
      addVote.call(this, 1)
    },
    clickNo() {
      addVote.call(this, 0)
    },
    loadMoreYesOpinions() {
      return PubApi.GetProblemOpinions(this.problem.id, 1, this.yesOpinions.length)
    },
    loadMoreNoOpinions() {
      return PubApi.GetProblemOpinions(this.problem.id, 0, this.noOpinions.length)
    }
  },
  computed: {
    imageName() {
      if (this.problem.imageName) {
        let lastIndexOfDot = this.problem.imageName.lastIndexOf('.')
        return this.problem.imageName.substr(0, lastIndexOfDot)
      } else {
        return ''
      }
    },
    imageExtension() {
      if (this.problem.imageName) {
        let lastIndexOfDot = this.problem.imageName.lastIndexOf('.')
        return this.problem.imageName.substr(lastIndexOfDot + 1)
      } else {
        return ''
      }
    }
  },
  fetch({ store, route, redirect }) {
    let isAuthenticated = store.gettersAuth.isAuthenticated
    let currentProblem = store.getters.currentProblem
    let problemTask =
      currentProblem && (currentProblem.alias === route.params.alias)
        ? Promise.resolve(currentProblem)
        : PubApi.GetProblem(route.params.alias)
    return problemTask
      .then(data => {
        data.alias = route.params.alias
        store.dispatch(SET_CURRENT_PROBLEM, data)
        if (!isAuthenticated || store.getters.hasVoted(data.alias) !== undefined) {
          redirect(302, `/${store.getters.lang}/problem/${route.params.alias}`)
        }
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  }
}
</script>

<style scoped>
  .problemImage
  {
    position: absolute;
    bottom: 50%;
    right: 50%;
    transform: translateX(50%) translateY(50%);
    filter: grayscale(80%);
    border: 4px double gray;
  }
  .layoutContainer
  {
    position: relative;
  }
  .wrapInfinite{
    max-height: 300px;
    overflow: auto;
  }
</style>
</style>
