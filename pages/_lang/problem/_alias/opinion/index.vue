<template>
  <v-container fluid text-xs-center id="editOpinion" class="pa-0">
    <v-layout column fill-height>
      <commonHeader :title="problem.header"></commonHeader>
      <v-layout>    
        <v-flex xs6 class="px-5 py-2" :order-xs2="isYesVote" :class="{ 'grey': isYesVote, 'darken-4': isYesVote, 'white--text': isYesVote }">
          Your opinion language
          <v-select :items="langs"
              v-model="lang"
              :dark="isYesVote" 
              style="max-width: 60px">
          </v-select>  
          <v-text-field clearable id="txtOpinionHeader" v-model="header" name="opinionHeader" label="Header" :dark="isYesVote" ></v-text-field>
          <v-textarea outline id="txtOpinionBody" v-model="body" name="opinionBody" label="Body" :dark="isYesVote" ></v-textarea>
          <v-btn id="btnSubmitOpinion" flat @click="submit" :dark="isYesVote" >Submit</v-btn>
        </v-flex>
        <v-flex xs6 class="px-5 py-2" :class="{ 'grey': !isYesVote,  'darken-4': !isYesVote, 'white--text': !isYesVote }">
          <h1 id="viewHeader">{{ header }}</h1>
          <div id="viewBody" v-html="compiledMarkdownBody"></div>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import marked from 'marked'
import {Langs} from '~/common/constants'
import {ADD_OPINION} from '~/common/names'

export default {
  name: 'newOpinion',
  data() {
    return {
      header: 'Your opinion header',
      body: '## Please describe your opinion clearly and objectively',
      problem: this.$store.getters.currentProblem,
      langs: Langs,
      lang: this.$store.getters.lang,
      isYesVote: this.$store.getters.currentProblem.voteResult === 1
    }
  },
  computed: {
    compiledMarkdownBody() {
      return marked(this.body, { sanitize: true })
    }
  },
  methods: {
    submit() {
      this.$store.dispatch(ADD_OPINION, { problem: this.problem, locale: this.lang, header: this.header, body: this.body })
        .then((str) => {
          setTimeout(() => {
            this.$router.push(
              `/${this.$store.getters.lang}/problem/${this.$route.params.alias}`
            )
          }, 2000)
        })
    }
  }
}
</script>

<style scoped>
</style>