<template>
  <v-container fluid text-xs-center id="problem" class="pa-0">
    <v-layout column fill-height class="layoutContainer">
      <commonHeader :title="problem.header"></commonHeader>
      <v-layout>
        <v-flex xs6>
          <div class="answer black--text">
            <div class="answerLabel">Yes</div>
            <div class="answerNumber">{{problem.yesCount}}</div>
            <template v-if="$store.gettersAuth.isAuthenticated && voteResult === 1">
                <opinionLink :problem="problem" ></opinionLink>
            </template>
            <infinite-scroll :data="yesOpinions" :loadStep="loadMoreYesOpinions" class="wrapInfinite text-xs-left mx-5">
              <div v-for="(item,i) in yesOpinions" :key="i" class="mt-1 mb-1">              
                <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${item.nickName}/${item.opinionAlias}`">{{item.opinionHeader}}</router-link>
              </div>
            </infinite-scroll>   
          </div>
        </v-flex>  
        <v-flex xs6 class="grey darken-4 white--text">
          <div class="answer">
            <div class="answerLabel">No</div>
            <div class="answerNumber">{{problem.noCount}}</div>
            <template v-if="$store.gettersAuth.isAuthenticated && voteResult === 0">
              <opinionLink :problem="problem" ></opinionLink>
            </template>
            <infinite-scroll :data="noOpinions" :loadStep="loadMoreNoOpinions" class="wrapInfinite text-xs-right mx-5">
              <div v-for="(item,i) in noOpinions" :key="i" class="mt-1 mb-1">              
                <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${item.nickName}/${item.opinionAlias}`">{{item.opinionHeader}}</router-link>
              </div>
            </infinite-scroll>  
          </div>
        </v-flex>
      </v-layout>
      <div class="middleWindow" :style="{ width: middleWindowWidth + 'px', height: middleWindowHeight + 'px' }">
        <div v-show="!changeCountryView" class="mapView middleWindowInner">
          <worldMap :problem="problem" :width="middleWindowWidth" :height="middleWindowHeight"></worldMap>
        </div>
        <div v-show="changeCountryView" class="listView middleWindowInner">
          <v-data-table :items="problem.stats" :headers="countriesHeaders" hide-actions>
            <template slot="items" slot-scope="props">
              <td class="text-xs-left">{{props.item.countryName}}</td>
              <td class="text-xs-left">{{props.item.yesCount}}</td>
              <td class="text-xs-left">{{props.item.noCount}}</td>
              <td class="text-xs-left">
                <v-progress-linear class="ratio" :value="props.item.ratio" background-color="black" color="white" height="20"></v-progress-linear>
              </td>
            </template>
          </v-data-table>          
        </div>
        <v-btn class="switch" @click="changeCountryView = !changeCountryView">Switch view</v-btn>
      </div>
      <div class="filters">
        <div v-for="(division, paramName, index) in divisions" :key="paramName" class="filter">
          <v-select :items="division.key"
            :id="paramName"
            v-model="filters[paramName]"
            item-text="value"
            item-value="key"
            :dark="index % 2 !== 0"
            :label="division.value"
            :clearable="true"
            @change="changeFilter"
          ></v-select>  
        </div>
      </div>
    </v-layout>
  </v-container>   
</template>

<script>
import * as PubApi from '~/api/public'
import * as PrivApi from '~/api/private'
import { SET_CURRENT_PROBLEM } from '~/common/names'

export default {
  name: 'problem',
  data() {
    return {
      changeCountryView: false,
      countriesHeaders: [
        { text: 'Counry', value: 'countryName', align: 'left' },
        { text: 'Yes', value: 'yesCount', align: 'left' },
        { text: 'No', value: 'noCount', align: 'left' },
        { text: 'Ratio', value: 'ratio', align: 'left', sortable: false }
      ],
      middleWindowWidth: 700,
      middleWindowHeight: 400,
      filters: {},
      yesOpinions: [],
      noOpinions: []
    }
  },
  mounted() { 
    this.fillCountryInfo()
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
  computed: {
    voteResult() {
      return this.$store.getters.hasVoted(this.problem.alias)
    },
    problem() {
      return this.$store.getters.currentProblem
    },
    divisions() {
      return this.$store.gettersDivision.getDivisions
    }
  },
  methods: {
    changeFilter() {
      PrivApi.GetProblemWithFilters(this.problem.alias, this.filters)
        .then((filteredProblem) => {
          filteredProblem.alias = this.$route.params.alias
          this.problem = filteredProblem
          this.fillCountryInfo()
        })
    },
    fillCountryInfo() {
      if (this.problem.stats) {
        for (let stat of this.problem.stats) {
          var country = this.$store.gettersCountry.getCountryById(stat.countryId)
          stat.countryName = country ? country.N : ''
          stat.ratio = stat.yesCount * 100 / (stat.yesCount + stat.noCount)
        }
      }
    },
    loadMoreYesOpinions() {
      return PubApi.GetProblemOpinions(this.problem.id, 1, this.yesOpinions.length)
    },
    loadMoreNoOpinions() {
      return PubApi.GetProblemOpinions(this.problem.id, 0, this.noOpinions.length)
    }
  },
  fetch({ store, route, redirect }) {
    console.log('Prolem fetch is called')
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
        if (store.getters.hasVoted(data.alias) === undefined && isAuthenticated) {
          console.warn('Redirecting to answer')
          redirect(302, `/${store.getters.lang}/problem/${route.params.alias}/answer`)
        }
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  }
}
</script>
<style lang="stylus" scoped>
.answer
  height: 100px

.answerLabel
  font-size: 60px
  display: inline-block

.answerNumber
  font-size: 40px
  display: inline-block
  margin-left: 20px

.layoutContainer
  position: relative

.middleWindow
  position: absolute
  margin: auto
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: white
  border: 2px solid black
  overflow: hidden

.middleWindowInner
  width: 100%
  height: 100%

.listView
  overflow: auto

.switch
  position: absolute
  left: 0
  bottom: 0

.ratio
  border: 1px solid black

.filters
  position: absolute
  margin: 0 auto
  left: 0
  right: 0
  bottom: 0
  height: 160px
  width: 800px

.filter
  width: 300px
  display: inline-block
  margin: 0 10px

.filter .v-input
  padding-top: 0
  margin-top: 0

.wrapInfinite
  max-height: 300px
  overflow: auto

</style>
