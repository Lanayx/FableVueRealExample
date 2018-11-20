import * as Const from './constants.js'

/**
 * @param {Response}  response - A response.
 */
export function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else if (response.status === 401 || response.status === 403) {
    return Promise.reject(new Error(Const.Unauthorized))
  } else {
    response.text().then(t => console.error(t))
    return Promise.reject(new Error(response.statusText))
  }
}

/**
 * @param {Response}  response - A response.
 */
export function json(response) {
  return response.json()
}

/**
 * @param {RequestInfo}  url - The url.
 * @param {RequestInit}  obj - Fetch object.
 */
export function fetchJson(url, obj) {
  console.debug('Fetching ' + url)
  return fetch(url, obj)
    .then(status)
    .then(json)
}
