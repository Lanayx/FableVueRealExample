<template>
  <v-container fluid text-xs-center id="start" class="pt-0">
    <v-layout row wrap fill-height>  
      <v-flex xs6>        
        <div>{{profile.displayName}}</div>
        <div>{{profile.city}}</div>
        <div>{{displayCountry}}</div> 
        <slot name="info"></slot>
      </v-flex>
      <v-flex xs6>
          <img v-if="profile.tempImagePath" :src="profile.tempImagePath" :alt="profile.displayName" 
            width="250" height="250" class="d-inline">
          <img v-else-if="profile.imageName" :src="staticUrl+`/user/${profile.id}/${imageName}-250x250.${imageExtension}`"
            :alt="profile.displayName" class="d-inline">
          <img v-else-if="profile.id" src="~/assets/noPhoto250.png" alt="no-photo" class="d-inline">
      </v-flex> 
    </v-layout>
  </v-container>   
</template>

<script>

import * as Const from '~/common/constants'
export default {
  name: 'profile',
  props: ['profile'],
  data() {
    return {
      staticUrl: Const.StaticUrl
    }
  },
  computed: {
    displayCountry() {
      return this.$store.gettersCountry.getCountryById(this.profile.countryId).N
    },
    imageName() {
      let lastIndexOfDot = this.profile.imageName.lastIndexOf('.')
      return this.profile.imageName.substr(0, lastIndexOfDot)
    },
    imageExtension() {
      let lastIndexOfDot = this.profile.imageName.lastIndexOf('.')
      return this.profile.imageName.substr(lastIndexOfDot + 1)
    }
  }
}
</script>

<style scoped>

</style>