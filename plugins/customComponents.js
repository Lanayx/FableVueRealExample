import Vue from 'vue'
import CommonHeader from '~/components/CommonHeader.vue'
import Profile from '~/components/Profile.vue'
import OpinionLink from '~/components/OpinionLink.vue'
import InfiniteScroll from '~/components/InfiniteScroll.vue'
import WorldMap from '~/components/WorldMap.vue'
import OpinionProfile from '~/components/Opinion/Profile.vue'
import OpinionComments from '~/components/Opinion/Comments.vue'
Vue.component('commonHeader', CommonHeader)
Vue.component('profile', Profile)
Vue.component('opinionLink', OpinionLink)
Vue.component('infiniteScroll', InfiniteScroll)
Vue.component('worldMap', WorldMap)
Vue.component('opinionProfile', OpinionProfile)
Vue.component('opinionComments', OpinionComments)

Vue.filter('date', str => new Date(str).toLocaleDateString())
