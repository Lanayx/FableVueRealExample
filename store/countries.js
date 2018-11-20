import * as PubApi from '~/api/public.js'
import { LOAD_COUNTRIES } from '~/common/names.js'

/**
  @typedef Country
  @type {object}
  @property {string} I - ID.
  @property {string} C - Code.
  @property {string} N - Name.
 */

export const state = () => ({
  dict: {}
})

export const getters = {
  getCountryById: (state, getters, rootState, rootGetters) =>
    /**
     * @param {string} id Country 3-digit id
     * @return {Country} The country.
     */
    (id) => {
      let cts = state.dict[rootGetters.lang]
      return cts
        ? cts.find(cnt => { return cnt.I === id }) || {}
        : {}
    },
  getCountryByCode: (state, getters, rootState, rootGetters) =>
    /**
     * @param {string} code Country 2-letter code
     * @return {Country} The country.
     */
    (code) => {
      let cts = state.dict[rootGetters.lang]
      return cts
        ? cts.find(cnt => { return cnt.C === code }) || {}
        : {}
    }
}

export const actions = {
  [LOAD_COUNTRIES]: ({ state, rootState, rootGetters }) => {
    let lang = rootGetters.lang
    return PubApi.GetCountries()
      .then(res => {
        state.dict[lang] = res
        console.debug('Countries Loaded')
      })
      .catch(err => console.error(err))
  }
}
