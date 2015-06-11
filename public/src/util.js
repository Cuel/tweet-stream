/*global $*/
'use strict'

var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  .test(window.navigator.userAgent)

function stripNormalFromUrl (url) {
  return url
  .split(' ')
  .reverse()
  .join(' ')
  .replace('_normal', '')
  .split(' ')
  .reverse()
  .join(' ')
}

function parseURLs (str) {
  var pattern = /(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi
  return str.replace(pattern, '$1<a href="$2">$2</a>')
}

function parseTwitterUserNames (str) {
  return str.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
    var username = u.replace('@', '')
    return u.link('http://twitter.com/' + username)
  })
}

function parseHashtags (str) {
  return str.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
    var tag = t.replace('#', '%23')
    return t.link('http://search.twitter.com/search?q=' + tag)
  })
}

function preLoadImage (url) {
  var Q = $.Deferred()

  var img = $('<img />')
  .attr('src', url)
  .load(function () {
    img.remove()
    Q.resolve()
  })

  return Q.promise()
}

exports = module.exports = {
  isMobile: isMobile,
	preLoadImage: preLoadImage,
	parseHashtags: parseHashtags,
	stripNormalFromUrl: stripNormalFromUrl,
	parseTwitterUserNames: parseTwitterUserNames,
	parseURLs: parseURLs
}
