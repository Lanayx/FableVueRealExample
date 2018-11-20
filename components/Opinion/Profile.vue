<template>
  <div>
    <profile :profile="profile"></profile>
    <v-tabs>
      <v-tab>Opinions</v-tab>
      <v-tab>Votes</v-tab>
      <v-tab-item>
        <infinite-scroll :data="opinions" :loadStep="loadMoreOpinions" class="wrapInfinite">
          <div v-for="(item,i) in opinions" :key="i" class="mt-1 mb-1">              
            <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${profile.nickName}/${item.opinionAlias}`">{{item.opinionHeader}}</router-link>
          </div>
        </infinite-scroll>   
      </v-tab-item>
      <v-tab-item>
        <infinite-scroll :data="votes" :loadStep="loadMoreVotes" class="wrapInfinite">
          <div v-for="(item,i) in votes" :key="i" class="mt-1 mb-1">
            {{item.header + ' ' + (item.result ? '(+)' : '(-)')}}
          </div>
        </infinite-scroll>          
      </v-tab-item>
    </v-tabs> 
    <template v-if="profile.id !== $store.gettersAuth.id">        
      <v-btn v-if="!isSubscribed" @click="subscribe">Subscribe</v-btn> 
      <v-btn v-else @click="unsubscribe">Unsubscribe</v-btn>
    </template>
  </div>
</template>

<script>
import * as PubApi from '~/api/public.js'
import { SUBSCRIBE, UNSUBSCRIBE } from '~/common/names.js'

export default {
  name: 'opinionProfile',
  props: ['profile'],
  data() {
    return {
      votes: [],
      opinions: []
    }
  },
  methods: {
    subscribe() {
      this.$store.dispatch(SUBSCRIBE, this.profile)
    },
    unsubscribe() {
      this.$store.dispatch(UNSUBSCRIBE, this.profile)
    },
    loadMoreVotes() {
      return PubApi.GetUserVotes(this.profile.id, this.votes.length)
    },
    loadMoreOpinions() {
      return PubApi.GetUserOpinions(this.profile.id, this.opinions.length)
    }
  },
  computed: {
    isSubscribed() {
      return this.$store.getters.isSubscribedTo(this.$route.params.nickName)
    }
  },
  mounted() {
    Promise.all([
      PubApi.GetUserVotes(this.profile.id)
        .then(data => {
          this.votes = data
        }),
      PubApi.GetUserOpinions(this.profile.id)
        .then(data => {
          this.opinions = data
        })
    ])
  }
}
</script>

<style scoped>
  .wrapInfinite{
    height: 130px;
    overflow: auto;
  }
</style>