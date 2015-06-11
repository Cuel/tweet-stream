/*global $, Mustache*/
'use strict'

var socket = require('./socket')
var util = require('./util')
var template = require('./tweet.tmpl.html')

var TWEET_CNTR = $('#tweets')
var tweetQueue = []

// Let mustache parse the template to speed things up
Mustache.parse(template)

socket.onTweet(function (tweet) {
  if (Array.isArray(tweet)) {
    tweet.forEach(parseTweet)
  }else {
    parseTweet(tweet)
  }
})

function parseTweet (tweet) {
  // For full res images on desktops
  if (!util.isMobile) {
    tweet.img = util.stripNormalFromUrl(tweet.img)
  }
  tweet.text = util.parseTwitterUserNames(tweet.text)
  tweet.text = util.parseURLs(tweet.text)
  tweet.text = util.parseHashtags(tweet.text)

  util.preLoadImage(tweet.img)
  .then(function imageLoaded () {
    addToRenderQueue(tweet)
  })
}

function addToRenderQueue (tweet) {
  var t = $(Mustache.render(template, {tweet: tweet}))
  tweetQueue.push(t)
  runTweetQueue()
}

var queueRunning = false
function runTweetQueue () {
  if (queueRunning || !tweetQueue.length) return
  queueRunning = true

  tweetQueue[0]
  .prependTo(TWEET_CNTR)
  .hide()
  .slideDown(function animDone () {
    tweetQueue.shift()
    queueRunning = false
    runTweetQueue()
  })
}

exports = module.exports = {
  clearQueue: function () {
    tweetQueue = []
  }
}
