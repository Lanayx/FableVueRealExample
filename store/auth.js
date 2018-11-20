import { AUTH_SUCCESS, GOOGLE_AUTH, AUTH_LOGOUT, REFRESH_TOKEN, UPDATE_ACCESS_TOKEN, LOAD_USER_DATA } from '../common/names.js'
import * as PubApi from '~/api/public.js'
import jsCookie from 'js-cookie'
var jwtDecode = require('jwt-decode')

export const state = () => {
  let xAuth = jsCookie.get('x-auth')
  return {
    accessToken: xAuth ? xAuth.accessToken : '',
    refreshToken: xAuth ? xAuth.refreshToken : ''
  }
}

export const getters = {
  accessTokenIsActive: state => state.accessToken && (jwtDecode(state.accessToken).exp > Math.floor(Date.now() / 1000)),
  bearerToken: state => state.accessToken,
  nickName: state => state.accessToken ? jwtDecode(state.accessToken).unique_name : '',
  id: state => state.accessToken ? jwtDecode(state.accessToken).sub : '',
  isAuthenticated: state => state.refreshToken && (jwtDecode(state.refreshToken).exp > Math.floor(Date.now() / 1000)),
  cookieToken: state => state
}

export const actions = {
  [GOOGLE_AUTH]: ({ dispatch }, idToken) => {
    return new Promise((resolve, reject) => { // The Promise used for router redirect in login
      PubApi.GoogleSignIn({
        idToken: idToken
      })
        .then(json => {
          return dispatch(AUTH_SUCCESS, json)
        })
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  [REFRESH_TOKEN]: ({ dispatch, getters, state }) => {
    return new Promise((resolve, reject) => { // The Promise used for router redirect in login
      PubApi.RefreshToken({
        userId: getters.id,
        refreshToken: state.refreshToken
      })
        .then(json => {
          return dispatch(AUTH_SUCCESS, json)
        })
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  [UPDATE_ACCESS_TOKEN]: ({ state }, accessToken) => {
    state.accessToken = accessToken
    let token = {
      accessToken: accessToken,
      refreshToken: state.refreshToken
    }
    if (process.client) {
      jsCookie.set('x-auth', JSON.stringify(token), {expires: 7})
    }
  },
  [AUTH_SUCCESS]: ({ state, dispatch }, token) => {
    state.accessToken = token.accessToken
    state.refreshToken = token.refreshToken
    if (process.client) {
      jsCookie.set('x-auth', JSON.stringify(token), {expires: 7})
    }
    return dispatch(LOAD_USER_DATA, null, { root: true })
  },
  [AUTH_LOGOUT]: ({ state }) => {
    state.accessToken = ''
    state.refreshToken = ''
    if (process.client) {
      jsCookie.remove('x-auth')
    }
  }
}
