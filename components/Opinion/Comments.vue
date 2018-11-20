<template>
  <div>
    <h1>Comments</h1>
    <v-list two-line>
      <v-list-group
        v-for="commentGr in commentGroups"
        v-model="commentGr.active"
        :key="commentGr[0].threadUserId"
        no-action
      >
        <v-list-tile slot="activator">
          <v-list-tile-avatar class="my-1">
            <v-img
              :src="getImageSrc(commentGr[0])"
                height="40px"
                width="40px"
                contain
                class="ma-2"
            ></v-img>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ commentGr[0].nickName }}&nbsp;({{ commentGr.length }})</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div class="commentsContainer">
          <template v-for="(comment, index) in commentGr">
            <v-divider :key="index" 
                :inset="true"></v-divider>
            <v-list-tile              
              :key="comment.id"
              avatar
              style="height: inherit"
              class="my-1"
            >
              <v-list-tile-avatar>
                <v-img
                  :src="getImageSrc(comment)"
                    height="40px"
                    width="40px"
                    contain
                    class="ma-2"
                ></v-img>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <div>{{ comment.text }}</div> <!-- TODO overflow -->
                <v-list-tile-sub-title>
                  <span>Created {{ comment.modifiedAt | date }}</span>
                  <span>&nbsp;/ Modified {{ comment.createdAt | date }}</span>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-layout>
                  <v-flex xs6>
                    <v-layout column>
                      <v-flex>
                        <v-btn v-if="isLiked(comment.id, 1)" flat icon class="likeIcon" color="blue"><v-icon>thumb_up</v-icon></v-btn>
                        <v-btn v-else flat icon class="likeIcon" @click="likeComment(comment.id, 1)"><v-icon>thumb_up</v-icon></v-btn>
                      </v-flex>
                      <v-flex><span>{{ comment.upLikeCount }}</span></v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs6>               
                    <v-layout column>
                      <v-flex>
                        <v-btn v-if="isLiked(comment.id, 0)" flat icon class="likeIcon" color="blue"><v-icon>thumb_down</v-icon></v-btn>
                        <v-btn v-else flat icon class="likeIcon" @click="likeComment(comment.id, 0)"><v-icon>thumb_down</v-icon></v-btn>
                      </v-flex>
                      <v-flex><span>{{ comment.downLikeCount }}</span></v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>                
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </div>
      </v-list-group>
    </v-list>
    <v-btn @click="addComment">Add Comment</v-btn>
  </div>

</template>
<script>
import * as PrivApi from '~/api/private'
import * as Const from '~/common/constants'
import { GroupBy } from '~/common/tools'
import { ADD_COMMENT_LIKE, UPDATE_COMMENT_LIKE } from '~/common/names.js'
export default {
  name: 'opinionComments',
  data() {
    return {
      myCommentLikes: []
    }
  },
  computed: {
    commentGroups() {
      return GroupBy(this.$store.gettersComment.currentComments, c => c.threadUserId)
    }
  },
  methods: {
    addComment() {
      PrivApi.AddComment({
        opinionId: this.$store.getters.currentOpinion.id,
        threadUserId: this.$store.gettersAuth.id,
        locale: this.$store.getters.lang,
        text: prompt('Please enter your name', 'Harry Potter')
      })
        .catch((reason) => {
          console.error(reason)
        })
    },
    likeComment(commentId, result) {
      if (this.$store.gettersAuth.isAuthenticated) {
        var isAlreadyLiked = this.isLiked(commentId, 1 - result)
        var likeFunction = 
          isAlreadyLiked
          ? UPDATE_COMMENT_LIKE
          : ADD_COMMENT_LIKE
        this.$store.dispatchComment(likeFunction, {
          commentId: commentId,
          result: result
        })
          .then(() => {
            if (isAlreadyLiked) {
              this.myCommentLikes.find(like => like.commentId === commentId).result = result
            }
          })
      }
    },
    getImageSrc(comment) {
      if (comment.imageName) {
        let lastIndexOfDot = comment.imageName.lastIndexOf('.')
        let imageName = comment.imageName.substr(0, lastIndexOfDot)
        let extension = comment.imageName.substr(lastIndexOfDot + 1)
        return Const.StaticUrl + `/user/${comment.userId}/${imageName}-80x80.${extension}`
      } else {
        return 'http://via.placeholder.com/250x250?text=No%20Photo'
      }
    },
    isLiked(commentId, result) {
      return this.myCommentLikes.find(like => like.commentId === commentId && like.result === result)
    }
  },
  mounted(){
    if (this.$store.gettersAuth.isAuthenticated) {
      PrivApi.GetOpinionCommentsLikes(this.$store.getters.currentOpinion.id)
        .then((data) => {
          this.myCommentLikes = data
        }).catch((reason) => {
            console.error(reason)
          })
    }
  }
}
</script>

<style lang="stylus" scoped>
  .commentsContainer
    max-height: 250px
    overflow: auto
  .likeIcon
    margin: 5px 0 -5px
</style>

