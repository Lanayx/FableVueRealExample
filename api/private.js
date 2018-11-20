import * as Const from '~/common/constants'
import * as Http from '~/common/http'
import { REFRESH_TOKEN } from '~/common/names'

let _router
let _store
let _refreshingPromise
let _refreshingPromiseInProgress
let _redirectInProgress

export default ({ app, store }) => {
  _router = app.router
  _store = store
}

const refreshTokenAndContinue = (url, obj) => {
  if (_store.gettersAuth.isAuthenticated) {
    if (!_refreshingPromiseInProgress) {
      _refreshingPromiseInProgress = true
      _refreshingPromise = _store.dispatchAuth(REFRESH_TOKEN)
        .then(() => {
          return httpFetch(url, obj)
        })
        .catch(
          (/** @type {Error} **/reason) => {
            if (reason && reason.message === Const.Unauthorized) {
              console.debug('Log out 1')
              _router.push('/logout')
            }
            return Promise.reject(reason)
          }
        )
        .finally(() => {
          _refreshingPromiseInProgress = false
        })
      return _refreshingPromise
    } else {
      return _refreshingPromise.then(() => {
        return httpFetch(url, obj)
      })
    }
  } else {
    if (!_redirectInProgress) {
      _redirectInProgress = true
      console.debug('Log out 2')
      _router.push('/logout', () => { _redirectInProgress = false }, () => { _redirectInProgress = false })
      return Promise.reject(new Error(Const.NotAuthenticated))
    } else {
      return Promise.reject(new Error(Const.NotAuthenticated))
    }
  }
}

const httpFetch = (url, obj) => {
  if (_store.gettersAuth.accessTokenIsActive) {
    if (!obj.headers) {
      obj.headers = { 'Authorization': 'Bearer ' + _store.gettersAuth.bearerToken }
    } else {
      obj.headers.Authorization = 'Bearer ' + _store.gettersAuth.bearerToken
    }
    return Http.fetchJson(url, obj)
      .catch(
        (/** @type {Error} **/reason) => {
          if (reason && reason.message === Const.Unauthorized) {
            console.warn('Unexpected unauthorized. Refreshing token.')
            return refreshTokenAndContinue(url, obj)
          }
          return Promise.reject(reason)
        }
      )
  } else {
    console.debug('Access token expired. Refreshing token.')
    return refreshTokenAndContinue(url, obj)
  }
}

export function Vote(voteObj) {
  return httpFetch(`${Const.ApiUrl}/vote/add`, {
    method: 'POST',
    body: JSON.stringify(voteObj)
  })
}

export function AddLike(likeObj) {
  return httpFetch(`${Const.ApiUrl}/like/add`, {
    method: 'POST',
    body: JSON.stringify(likeObj)
  })
}

export function UpdateLike(likeObj) {
  return httpFetch(`${Const.ApiUrl}/like/update`, {
    method: 'POST',
    body: JSON.stringify(likeObj)
  })
}

export function GetProfile() {
  return httpFetch(`${Const.ApiUrl}/profile`, {
    method: 'GET'
  })
}

export function UpdateProfile(data) {
  return httpFetch(`${Const.ApiUrl}/profile/update`, {
    method: 'POST',
    body: data
  })
}

export function GetSubscriptions(skip, limit) {
  return httpFetch(`${Const.ApiUrl}/subscriptions?skip=${skip || 0}&limit=${limit || 6}`, {
    method: 'GET'
  })
}

export function GetOpinions(skip, limit) {
  return httpFetch(`${Const.ApiUrl}/${_store.getters.lang}/opinions?skip=${skip || 0}&limit=${limit || 6}`, {
    method: 'GET'
  })
}

export function GetUnvotedProblems(skip, limit) {
  return httpFetch(`${Const.ApiUrl}/${_store.getters.lang}/problems/unvoted?skip=${skip || 0}&limit=${limit || 6}`, {
    method: 'GET'
  })
}

export function GetVotedProblems(skip, limit) {
  return httpFetch(`${Const.ApiUrl}/${_store.getters.lang}/problems/voted?skip=${skip || 0}&limit=${limit || 6}`, {
    method: 'GET'
  })
}

export function GetLikes(skip, limit) {
  return httpFetch(`${Const.ApiUrl}/likes?skip=${skip || 0}&limit=${limit || 6}`, {
    method: 'GET'
  })
}

export function GetProblemWithFilters(alias, filters) {
  let url = new URL(`${Const.ApiUrl}/${_store.getters.lang}/problem/${alias}`)
  for (let filterName in filters) {
    let value = filters[filterName]
    if (value > 0) {
      url.searchParams.set(filterName, value)
    }
  }
  return httpFetch(url.toString(), {
    method: 'GET'
  })
}

export function AddOpinion(opinionObj) {
  return httpFetch(`${Const.ApiUrl}/opinion/add`, {
    method: 'POST',
    body: JSON.stringify(opinionObj)
  })
}

export function Subscribe(subscribeObj) {
  return httpFetch(`${Const.ApiUrl}/subscription/add`, {
    method: 'POST',
    body: JSON.stringify(subscribeObj)
  })
}

export function Unsubscribe(subscribeObj) {
  return httpFetch(`${Const.ApiUrl}/subscription/delete`, {
    method: 'POST',
    body: JSON.stringify(subscribeObj)
  })
}

export function AddComment(commentObj) {
  return httpFetch(`${Const.ApiUrl}/comment/add`, {
    method: 'POST',
    body: JSON.stringify(commentObj)
  })
}

export function AddCommentLike(commentLikeObj) {
  return httpFetch(`${Const.ApiUrl}/commentLike/add`, {
    method: 'POST',
    body: JSON.stringify(commentLikeObj)
  })
}

export function UpdateCommentLike(commentLikeObj) {
  return httpFetch(`${Const.ApiUrl}/commentLike/update`, {
    method: 'POST',
    body: JSON.stringify(commentLikeObj)
  })
}

export function GetOpinionCommentsLikes(opinionId) {
  return httpFetch(`${Const.ApiUrl}/opinionCommentsLikes/${opinionId}`, {
    method: 'GET'
  })
}