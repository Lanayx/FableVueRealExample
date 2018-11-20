import * as PubApi from '~/api/public.js'
import { LOAD_DIVISIONS } from '~/common/names.js'

export const state = () => ({
  dict: {}
})

export const getters = {
  getDivisions: (state, getters, rootState, rootGetters) => state.dict[rootGetters.lang]
}

export const actions = {
  [LOAD_DIVISIONS]: ({ state, rootState, rootGetters }) => {
    let lang = rootGetters.lang
    return PubApi.GetDivisions()
      .then(res => {
        state.dict[lang] = res
        console.debug('Divisions Loaded')
      })
      .catch(err => console.error(err))
  }
}
