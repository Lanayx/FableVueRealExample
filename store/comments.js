import {  SET_CURRENT_COMMENTS, CHANGE_COMMENTS_VISIBILITY,
  ADD_COMMENT_LIKE, UPDATE_COMMENT_LIKE } from '~/common/names.js'


import * as PrivApi from '~/api/private'
import * as Const from '~/common/constants'



export const state = () => ({
  currentComments: [],
  commentsVisible: false

})

export const getters = {
  currentComments: state => state.currentComments,
  commentsVisible: state => state.commentsVisible
}

export const actions = {
  [SET_CURRENT_COMMENTS]: ({state, getters}, comments) => {
    state.currentComments = comments
  },
  [CHANGE_COMMENTS_VISIBILITY]: ({state, getters}, visible) => {
    state.commentsVisible = visible
  },
  [ADD_COMMENT_LIKE]: ({state, getters}, like) => {            
    PrivApi.AddCommentLike({
      commentId: like.commentId,
      result: like.result
    })
      .then(() => {
        let comment = state.currentComments.find(c => c.id === like.commentId)
        if (comment) {
          if (like.result === 1) {
            comment.upLikeCount ++
          } else {
            comment.downLikeCount ++
          }
        }
      })
      .catch((reason) => {
        console.error(reason)
      })
  },  
  [UPDATE_COMMENT_LIKE]: ({state, getters}, like) => {
    PrivApi.UpdateCommentLike({
      commentId: like.commentId,
      result: like.result
    })
      .then(() => {
        let comment = state.currentComments.find(c => c.id === like.commentId)
        if (comment) {
          if (like.result === 1) {
            comment.upLikeCount ++
            comment.downLikeCount --
          } else {
            comment.downLikeCount ++
            comment.upLikeCount --
          }
        }
      })
      .catch((reason) => {
        console.error(reason)
      })
  },
}
