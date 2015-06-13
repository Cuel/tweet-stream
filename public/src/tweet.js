/*global $, Mustache*/
'use strict'

var socket = require('./socket')
var util = require('./util')
var template = require('./tweet.tmpl.html')

var TWEET_CNTR = $('#js-tweets-container')
var MIN_MS_BETWEEN_TWEETS = 800
var tweetQueue = []
var queueRunning = false

// Let mustache parse the template to speed things up
Mustache.parse(template)

function parseTweet (tweet) {
  // For full res images on desktops
  if (!util.isMobile) {
    tweet.img = util.twitterImgToFullSize(tweet.img)
  }
  tweet.text = util.parseTwitterUserNames(tweet.text)
  tweet.text = util.parseURLs(tweet.text)
  tweet.text = util.parseHashtags(tweet.text)

  util.preLoadImage(tweet.img)
  .then(function imageLoaded () {
    compileTweet(tweet)
  })
}

function compileTweet (tweet) {
  var t = $(Mustache.render(template, {tweet: tweet}))
  renderTweet(t)
}

function renderTweet (tweet) {
  if (tweet) tweetQueue.push(tweet)
  if (queueRunning || !tweetQueue.length) return
  queueRunning = true

  tweetQueue[0]
  .prependTo(TWEET_CNTR)
  .hide()
  .slideDown(function animDone () {
    tweetQueue.shift()
    setTimeout(function () {
      queueRunning = false
      renderTweet()
    }, MIN_MS_BETWEEN_TWEETS)
  })
}

exports = module.exports = {
  init: function () {
    socket.onTweet(function (tweet) {
      if (Array.isArray(tweet)) {
        tweet.forEach(parseTweet)
      }else {
        parseTweet(tweet)
      }
    })
  },
  clearQueue: function () {
    tweetQueue = []
  }
}
