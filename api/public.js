import * as Http from '~/common/http.js'
import * as Const from '~/common/constants.js'

let _store

export default ({ store }) => {
  _store = store
}

export function GoogleSignIn(signInObj) {
  return Http.fetchJson(`${Const.ApiUrl}/googleSignIn`, {
    method: 'POST',
    body: JSON.stringify(signInObj)
  })
}

export function RefreshToken(refreshTokenObj) {
  return Http.fetchJson(`${Const.ApiUrl}/refreshToken`, {
    method: 'POST',
    body: JSON.stringify(refreshTokenObj)
  })
}

export function GetTopProblems() {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/problems/top`)
}

export function GetProblem(alias) {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/problem/${alias}`)
}

export function GetOpinion(alias, nickName) {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/opinion/${nickName}/${alias}`)
}

export function GetCountries() {
  return Http.fetchJson(`${Const.ApiUrl}/countries.${_store.getters.lang}.json`)
}

export function GetDivisions() {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/divisions`)
}

export function GetUserVotes(userId, skip, limit) {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/user/${userId}/votes?skip=${skip || 0}&limit=${limit || 6}`)
}

export function GetUserOpinions(userId, skip, limit) {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/user/${userId}/opinions?skip=${skip || 0}&limit=${limit || 6}`)
}

export function GetUserProfile(nickName) {
  return Http.fetchJson(`${Const.ApiUrl}/user/${nickName}/profile`)
}

export function GetProblemOpinions(problemId, voteResult, skip, limit) {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/problem/${problemId}/opinions/${voteResult}?skip=${skip || 0}&limit=${limit || 6}`)
}

export function GetOpinionComments(alias, nickName, skip, limit) {
  return Http.fetchJson(`${Const.ApiUrl}/${_store.getters.lang}/comments/${nickName}/${alias}?skip=${skip || 0}&limit=${limit || 10}`)
}
