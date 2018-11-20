<template>
  <v-container fluid text-xs-center id="dashboard" class="pa-0">
    <v-layout column fill-height>
      <commonHeader title="Dashboard"></commonHeader>
      <v-layout>      
        <v-flex xs6>
          <v-expansion-panel expand v-model="panel">
            <v-expansion-panel-content>
              <div slot="header">Not voted problems</div>
              <infinite-scroll :data="unvotedProblems" :loadStep="loadMoreUnvotedProblems" class="wrapInfinite">
                <v-card v-for="(item,i) in unvotedProblems" :key="i">
                  <v-card-text class="grey lighten-3">
                    <router-link tag="a" :to="`/${$store.getters.lang}/problem/${item.alias}/answer`">{{item.header}}</router-link>
                  </v-card-text>
                </v-card>
              </infinite-scroll>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">Voted problems</div>
              <div class="wrapInfinite">
                <v-card v-for="(item,i) in votedProblems" :key="i">
                  <v-card-text class="grey lighten-3">
                    <router-link tag="a" :to="`/${$store.getters.lang}/problem/${item.alias}`">{{item.header}}</router-link>
                  </v-card-text>
                </v-card>
              </div>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">Opinions</div>
              <div class="wrapInfinite">
                <v-card v-for="(item,i) in opinions" :key="i">
                  <v-card-text class="grey lighten-3">
                    <template v-if="$store.gettersAuth.nickName">
                      <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${$store.gettersAuth.nickName}/${item.opinionAlias}`">{{item.opinionHeader}}</router-link>
                    </template>
                    <template v-else>
                      {{item.header}} (Please fill in your nickname to get link)
                    </template>
                  </v-card-text>
                </v-card>
              </div>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">Subscriptions</div>
                <div class="wrapInfinite">
                <v-card v-for="(item,i) in subscriptions" :key="i">
                  <v-card-text class="grey lighten-3">
                    <router-link tag="a" :to="`/${$store.getters.lang}/opinion/${item.nickName}/${item.alias}`">{{item.displayName}}</router-link>
                  </v-card-text>
                </v-card>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>
        <v-flex xs-6 class="grey darken-4 white--text px-5 py-2" >
          <template v-if="profileMode === 'view'">
            <profile :profile="profile">
              <template slot="info">  
                <v-btn id="btnEdit" @click="editMode">Edit</v-btn>
              </template>           
            </profile>   
          </template>
          <template v-if="profileMode === 'edit'">
            <div>
                <input type="file" accept="image/*" @change="onFileChange" />
            </div>
            <div>
              <v-btn id="btnGetLocation" v-if="!editProfile.countryId" @click="getLocation">Determine Country and City</v-btn>
              <v-btn id="btnGetLocation" v-else @click="getLocation">Update Country and City</v-btn>
            </div>          
            <div v-if="editProfile.countryId">
              {{displayCountryEdit}},&nbsp;{{editProfile.city}}
            </div>
            <v-text-field
              id="txtDisplayName"
              v-model="editProfile.displayName"
              label="Display Name"
              :type="'text'"
              clearable
              dark
            ></v-text-field>
            <v-text-field
              id="txtNickName"
              v-model="editProfile.nickName"
              label="NickName"
              :type="'text'"
              clearable
              dark
            ></v-text-field>
            <div v-for="(division, paramName) in divisions" :key="paramName">
              <v-select :items="division.key"
                :id="paramName"
                v-model="editProfile[paramName]"
                item-text="value"
                item-value="key"
                bottom
                dark
                :label="division.value"
              ></v-select>  
            </div>
            
            <v-btn id="btnEditDone" @click="updateProfile(); profileMode = 'view'" 
              :class="profileIsFilled() ? 'theme--light' : 'theme--dark' "  
              :disabled="!profileIsFilled()">Done</v-btn>
            <v-btn id="btnEditCancel" @click="profileMode = 'view'">Cancel</v-btn>
          </template>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import * as PrivApi from '~/api/private'
import { NullReplacer } from '~/common/tools'
import { UPDATE_ACCESS_TOKEN } from '~/common/names'

var geocoder

function positionSuccess(position) {
  var lat = position.coords.latitude
  var lng = position.coords.longitude
  codeLatLng.call(this, lat, lng)
}

function positionError() {
  alert('Can\'t resolve your location. Please allow getting your position to verify country')
}

function getGeoCodeAsync(obj) {
  return new Promise((resolve, reject) => {
    geocoder.geocode(obj, (results, status) => { return resolve({results, status}) }, reject)
  })
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function codeLatLng(lat, lng) {
  let latlng = new google.maps.LatLng(lat, lng)
  getGeoCodeAsync({latLng: latlng}).then(
    places => {
      console.log(places)
      let cityFound = false
      let areaFound = false
      let countryFound = false
      if (places.status === google.maps.GeocoderStatus.OK) {
        for (let place of places.results) {
          for (let component of place.address_components) {
            switch (component.types[0]) {
              case 'locality':
                if (!cityFound) {
                  this.$set(this.editProfile, 'city', component.long_name)
                  cityFound = true
                }
                break
              case 'administrative_area_level_1':
                if (!areaFound) {
                  this.$set(this.editProfile, 'area', component.long_name)
                  areaFound = true
                }
                break
              case 'country':
                if (!countryFound) {
                  let country = this.$store.gettersCountry.getCountryByCode(component.short_name)
                  this.$set(this.editProfile, 'countryId', country.I)
                  countryFound = true
                }
                break
            }
          }
        }
      } else {
        alert('Geocoder failed due to: ' + status)
      }
    })
}

export default {
  name: 'dashboard',
  data() {
    return {
      profile: {},
      editProfile: {},
      subscriptions: {},
      opinions: {},
      votedProblems: [],
      unvotedProblems: [],
      divisions: [],
      panel: [true, true, true, true],
      profileMode: 'view',
      avatar: null,
      imageName: ''
    }
  },
  mounted() {
    this.profile = this.$store.getters.profile
    this.subscriptions = this.$store.getters.subscriptions
    this.opinions = this.$store.getters.opinions
    this.divisions = this.$store.gettersDivision.getDivisions
    PrivApi.GetUnvotedProblems()
      .then(data => {
        this.unvotedProblems = data
        this.votedProblems = this.$store.getters.votes.filter(
          vote => !this.opinions.find(opinion => {
            return opinion.problemAlias === vote.alias
          })
        )
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  },
  middleware: 'auth',
  methods: {
    getLocation() {
      geocoder = new google.maps.Geocoder()
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionSuccess.bind(this), positionError.bind(this))
      } else {
        alert('Please use another browser')
      }
    },
    updateProfile() {
      this.profileMode = 'view'
      this.profile = deepCopy(this.editProfile)
      let data = new FormData()
      if (this.avatar) {
        data.append('avatar', this.avatar, this.avatar.name)
      }
      data.append('profile', JSON.stringify(this.profile, NullReplacer))
      PrivApi.UpdateProfile(data)
        .then(json => {
          if (json) {
            this.$store.dispatchAuth(UPDATE_ACCESS_TOKEN, json.accessToken)
            if (json.imageName) {
              this.profile.imageName = json.imageName
            } 
          }
        })
        .catch(error => {
          console.error('Request failed', error)
        })
    },
    editMode() {
      this.profileMode = 'edit'
      this.editProfile = deepCopy(this.profile)
    },
    onFileChange(e) {
      this.avatar = e.target.files[0]
      var reader = new FileReader()
      reader.onload = (e) => {
        this.editProfile.tempImagePath = e.target.result
      }
      reader.readAsDataURL(this.avatar)
    },
    profileIsFilled() {
      let filled = this.editProfile.countryId && this.editProfile.displayName && this.editProfile.nickName
      if (!filled) {
        return false
      }
      for (let paramName in this.divisions) {
        if (this.editProfile[paramName] <= 0) {
          return false
        }
      }
      return true
    },
    loadMoreUnvotedProblems() {
      return PrivApi.GetUnvotedProblems(this.unvotedProblems.length)
    }
  },
  computed: {
    displayCountryEdit() {
      return this.$store.gettersCountry.getCountryById(this.editProfile.countryId).N
    }
  }
}
</script>

<style lang="stylus" scoped>
  .wrapInfinite
    max-height: 200px
    overflow: auto
</style>