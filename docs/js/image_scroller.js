var util = require("../lib/functions.js")

module.exports = function(config){

  this.initial_load_size =  config.load_lim
  this.on         = true;
  this.extraTweets = []
  this.working    = false;

  this.img_root   = config.img_root

  this.renderTweets = function(tweets, map, popup){

    //Clear the current list of images
    var list = document.getElementById('images')
    list.innerHTML = "";
    var that = this;
    tweets.slice(0,this.initial_load_size).forEach(function(tweet){
      var li = document.createElement('li')
        li.className = 'visible-image'
        //li.innerHTML = `<p>Tweet:</p><p>${tweet.properties.id}</p>`
        li.style.backgroundImage = 'url(' + `${that.img_root}/thumb/${tweet.properties.id}.jpg` + ')';
        li.addEventListener('click',function(){
          that.tweetClicked(tweet, map, popup)
        })
        li.addEventListener('mouseenter',function(){
          that.tweetMouseEnter(tweet, map, popup)
        })
        li.addEventListener('mouseleave',function(){
          that.tweetMouseExit(tweet, map, popup)
        })
        list.appendChild(li)
    })

    this.extraTweets = tweets.slice(this.initial_load_size,tweets.length)
    this.working = false;
    document.getElementById('loading-bar').className = "m6"
  }

  /*
    This function will be called when the 'next' arrow is pressed to load more images for a given area
  */
  this.loadMore = function(map, popup){
    if(this.extraTweets.length){
      console.log("There are another " + this.extraTweets.length + " tweets to load")

      var list = document.getElementById('images')
      var that = this;
      this.extraTweets.slice(0,20).forEach(function(tweet){
        var li = document.createElement('li')
          li.className = 'visible-image'
          li.style.backgroundImage = 'url(' + `${that.img_root}/thumb/${tweet.properties.id}.jpg` + ')';
          li.addEventListener('click',function(){
            that.tweetClicked(tweet, map, popup)
          })
        list.appendChild(li)
      })
      this.extraTweets = this.extraTweets.slice(20,this.extraTweets.length)
    }else{
      return
    }
  }

  this.tweetMouseEnter = function(tweet, map, popup){
    if (tweet.geometry.type=="Point"){
      //If the layer is already active, just update the data
      if (map.getLayer('tweet-highlight-circle')){
        map.getSource('tweet-highlight-circle-coords').setData(tweet.geometry)
      }else{
        //Layer does not exist, add the source and the layer
        map.addSource('tweet-highlight-circle-coords',{
          "type" : 'geojson',
          "data" : tweet.geometry
        })
        map.addLayer({
          id:   "tweet-highlight-circle",
          type: "circle",
          source: 'tweet-highlight-circle-coords',
          "paint":{
            "circle-color":'blue'
          }
        })
      }

    }
  }


  this.tweetMouseExit = function(tweet, map, popup){
    console.log("LEAVING")
  }

  this.tweetClicked = function(tweet, map, popup){

    var imagePopUp = document.getElementById('image-popup')
      imagePopUp.style.display = 'block'
      imagePopUp.innerHTML =`<div class='image-popup'>
      <img src="${this.img_root}/medium/${tweet.properties.id}.jpg" />
      <p>${tweet.properties.id}</p>
      <p>${tweet.properties.text}</p>
      <p>${tweet.properties.user}</p>
   </div>`

    console.log(tweet.geometry, tweet.properties)
  }
}
