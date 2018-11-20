import { CHANGE_LANG, LOAD_COUNTRIES, AUTH_SUCCESS, SET_CURRENT_PROBLEM, LOAD_USER_DATA,
  SUBSCRIBE, UNSUBSCRIBE, VOTE, ADD_OPINION, ADD_LIKE, UPDATE_LIKE, LOAD_DIVISIONS, SET_CURRENT_OPINION,
  SET_CURRENT_PROFILE } from '~/common/names.js'

import jsCookie from 'js-cookie'
import * as PrivApi from '~/api/private'
import * as Const from '~/common/constants'
import { storeModule } from '~/plugins/storeModule'

if (process.server) {
  require('isomorphic-fetch')
  var cookie = require('cookie')
}
var loadingData = false

let addDays = (date, days) => {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const state = () => ({
  lang: jsCookie.get('x-lang') || '',
  currentProblem: {
    stats: []
  },
  currentOpinion: {},
  currentComments: [],
  currentProfile: {},
  commentsVisible: false,
  profile: {},
  subscriptions: [],
  opinions: [],
  votes: [],
  likes: []
})

export const getters = {
  lang: state => state.lang,
  currentProblem: state => state.currentProblem,
  currentOpinion: state => state.currentOpinion,
  currentProfile: state => state.currentProfile,
  profile: state => state.profile,
  subscriptions: state => state.subscriptions,
  opinions: state => state.opinions,
  votes: state => state.votes,
  isSubscribedTo: (state) =>
    /**
     * @param {string} nickName User nickName
     * @return {boolean} is subscribed.
     */
    (nickName) => state.subscriptions.find(sb => { return sb.nickName === nickName }),
  hasLiked: (state) =>
    /**
     * @param {string} opinionId Opinion id
     * @return {number} like result, undefined if doesn't exist.
     */
    (opinionId) => {
      var like = state.likes.find(like => { return like.opinionId === opinionId })
      return like === undefined ? undefined : like.result
    },
  hasVoted: (state) =>
    /**
     * @param {string} alias Problem alias
     * @return {number} like result, undefined if doesn't exist.
     */
    (alias) => {
      var vote = state.votes.find(vote => { return vote.alias === alias })
      return vote === undefined ? undefined : vote.result
    },
  getOpinionByProblemAlias: (state) =>
    /**
     * @param {string} alias Problem alias
     * @return {number} like result, undefined if doesn't exist.
     */
    (alias) => {
      return state.opinions.find(opinion => { return opinion.problemAlias === alias })
    },
  isMyOpinion: (state) =>
    /**
     * @param {string} opinionId Opinion id
     * @return {boolean} is my opinion.
     */
    (opinionId) => {
      var result = state.opinions.find(opinion => { return opinion.id === opinionId })
      return !!result
    },
  problemLink: (state, getters) => {
    /**
     * @param {string} alias Problem alias
     * @return {string} Problem link.
     */
    return (alias) => {
      return getters['auth/isAuthenticated'] && !state.votes.find(vote => { return vote.alias === alias })
        ? `/${state.lang}/problem/${alias}/answer`
        : `/${state.lang}/problem/${alias}`
    }
  }
}

export const actions = {
  async nuxtServerInit(store, {req, res, route, redirect}) {
    const cookies = cookie.parse(req.headers.cookie || '')
    if (cookies.hasOwnProperty('x-lang')) {
      await store.dispatch(CHANGE_LANG, cookies['x-lang'])
    } else {
      let lang = route.params.lang || 'en'
      await store.dispatch(CHANGE_LANG, lang)
      res.setHeader('Set-Cookie', cookie.serialize('x-lang', lang, {expires: new Date(2100, 1), path: '/'}))
    }
    if (cookies.hasOwnProperty('x-auth')) {
      let oldToken = cookies['x-auth']
      await store.dispatch('auth/' + AUTH_SUCCESS, JSON.parse(oldToken))
        .then(() => {
          let newToken = JSON.stringify(store.getters['auth/cookieToken'])
          if (oldToken !== newToken) {
            res.setHeader('Set-Cookie', cookie.serialize('x-auth', newToken, {expires: addDays(new Date(), 7), path: '/'}))
          }
        })
        .catch((reason) => {
          if (reason && reason.message === Const.Unauthorized) {
            res.setHeader('Set-Cookie', cookie.serialize('x-auth', '', {expires: addDays(new Date(), -1), path: '/'}))
            redirect('/logout')
          } else {
            console.error('nuxtServerInit: ' + reason)
          }
        })
    }
  },
  [CHANGE_LANG]: ({dispatch, getters, state}, lang) => {
    state.lang = lang
    if (process.client) {
      jsCookie.set('x-lang', lang, {expires: new Date(2100, 1)}) 
      // TODO find a better solution
      setTimeout( () => {    
        location.reload()
      }, 10)
    } else {
    // clean and reload cached data
      let loadDataPromise = getters['auth/isAuthenticated']
        ? dispatch(LOAD_USER_DATA)
        : Promise.resolve()
      return Promise.all([
        dispatch('country/' + LOAD_COUNTRIES),
        dispatch('division/' + LOAD_DIVISIONS),
        loadDataPromise
      ])
    }
  },
  [SET_CURRENT_PROBLEM]: ({state, getters}, problem) => {
    state.currentProblem = problem
    // fix opinion without alias right after adding opinion
    if (problem.opinionAlias) {
      let opinionWithoutAlias = state.opinions.find((op) => !op.opinionAlias && op.problemAlias === problem.alias)
      if (opinionWithoutAlias) {
        opinionWithoutAlias.opinionAlias = problem.opinionAlias
      }
    }
  },
  [SET_CURRENT_OPINION]: ({state, getters}, opinion) => {
    state.currentOpinion = opinion
  },
  [SET_CURRENT_PROFILE]: ({state, getters}, profile) => {
    state.currentProfile = profile
  },
  [LOAD_USER_DATA]: ({state}) => {
    console.debug('UserData loading ' + loadingData)
    if (!loadingData) {
      loadingData = true
      return Promise.all([
        PrivApi.GetProfile()
          .then(data => {
            console.debug('Profile loaded')
            state.profile = data
          }),
        PrivApi.GetSubscriptions(0, 1000)
          .then(data => {
            console.debug('Suscriptions loaded')
            state.subscriptions = data
          }),
        PrivApi.GetOpinions(0, 1000)
          .then(data => {
            console.debug('Opinions loaded')
            state.opinions = data
          }),
        PrivApi.GetVotedProblems(0, 1000)
          .then(data => {
            console.debug('Voted problems loaded')
            state.votes = data
          }),
        PrivApi.GetLikes(0, 1000)
          .then(data => {
            console.debug('Likes loaded')
            state.likes = data
          })
      ])
        .catch((reason) => {
          console.error('Data load error: ' + reason)
          if (reason && reason.message !== Const.NotAuthenticated) {
            throw reason
          }
        })
        .finally(() => {
          loadingData = false
        })
    } else {
      return Promise.resolve(0)
    }
  },
  [SUBSCRIBE]: ({state}, profile) => {
    return PrivApi.Subscribe({
      userId: profile.id
    }).then(() => {
      state.subscriptions.push({ nickName: profile.nickName })
    })
  },
  [UNSUBSCRIBE]: ({state}, profile) => {
    return PrivApi.Unsubscribe({
      userId: profile.id
    }).then(() => {
      state.subscriptions = state.subscriptions.filter((sb) => sb.nickName !== profile.nickName)
    })
  },
  [VOTE]: ({state}, {problem, result}) => {
    return PrivApi.Vote({
      problemId: problem.id,
      result: result
    }).then(() => {
      state.votes.push({
        alias: problem.alias,
        header: problem.header,
        result: result
      })
      if (state.currentProblem) {
        if (result === 1) {
          state.currentProblem.yesCount++
        } else if (result === 0) {
          state.currentProblem.noCount++
        }
      }
    })
  },
  [ADD_LIKE]: ({state}, like) => {
    return PrivApi.AddLike(like)
      .then(() => {
        state.likes.push(like)   
        if (like.result === 1) {     
          state.currentOpinion.upLikeCount++
        } else if (like.result === 0) {
          state.currentOpinion.downLikeCount++
        }
      })
  },
  [UPDATE_LIKE]: ({state}, like) => {
    return PrivApi.UpdateLike(like)
      .then(() => {
        state.likes.find(l => like.opinionId === l.opinionId).result = like.result
        if (like.result === 1) {     
          state.currentOpinion.upLikeCount++
          state.currentOpinion.downLikeCount--
        } else if (like.result === 0) {
          state.currentOpinion.downLikeCount++
          state.currentOpinion.upLikeCount--
        }
      })
  },
  [ADD_OPINION]: ({state}, {problem, locale, header, body}) => {
    return PrivApi.AddOpinion({
      locale: locale,
      header: header,
      body: body,
      problemId: problem.id
    }).then(() => {
      state.opinions.push({
        problemAlias: problem.alias,
        opinionHeader: header,
        opinionAlias: undefined // unavailable for now
      })
      state.currentProblem = {}
    })
  }
}

export const strict = false
export const plugins = [ storeModule ]
