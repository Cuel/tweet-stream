var read = require('fs').readFileSync
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var Twitter = require('node-tweet-stream')

var KEY_WORD = '#cats'
var credentials = JSON.parse(read('./twitter.json'))

// Create new twitter client
var t = new Twitter({
  consumer_key: credentials.consumer_key,
  consumer_secret: credentials.consumer_secret,
  token: credentials.access_token_key,
  token_secret: credentials.access_token_secret
})

// Tells twitter instance to listen on the keyword
// and parse any incoming tweets
t.track(KEY_WORD)
t.on('tweet', parseAndEmitTweet)

function parseAndEmitTweet (tweet) {
  var parsedTweet = {
    text: tweet.text,
    name: tweet.user.screen_name,
    img: tweet.user.profile_image_url
  }
  // Emit the parsed tweet to connected any clients
  io.emit('tweet', parsedTweet)
}

// Emit our keyword to the client once it connects
io.on('connection', function (socket) {
  console.log('client connected')
  socket.emit('keyword', KEY_WORD)
})

// Serve assets and index.html
app.use(express.static('public'))
app.get('/', function (req, res) {
  res.sendFile('index.html')
})

// Start server
server.listen(80, function onListening () {
  console.log('App listening')
})
