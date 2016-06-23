// TODO: notifications
// TODO: unplay a card I played
// TODO: autocomplete, and scopes: @bookChoice(@bookIdeas)
// TODO: visit and visit*

import Firebase from 'firebase'
import React from 'react'
import ReactDOM from 'react-dom'
import PlaySurface from './playSurface.jsx'

firebase.initializeApp({
  apiKey: "AIzaSyBm9oAcCktnQlaxNS1GvyraDGV7QtA6d78",
  authDomain: "bastard-183be.firebaseapp.com",
  databaseURL: "https://bastard-183be.firebaseio.com",
  storageBucket: "",
})

let {database} = firebase
let auth = firebase.auth()
let div = document.createElement('div')
var fb = new firebase.auth.FacebookAuthProvider()
var twit = new firebase.auth.TwitterAuthProvider()
var goog = new firebase.auth.GoogleAuthProvider()
var m
let scriptUrl = window.location.hash.slice(1)
document.body.appendChild(div)

let LoginButtons = () => {
  return <div>
    <button onClick={() => auth.signInWithPopup(fb)}>Join w Facebook</button>
    <button onClick={() => auth.signInWithPopup(goog)}>Join w Google</button>
    <button onClick={() => auth.signInWithPopup(twit)}>join w Twitter</button>
  </div>
}

let draw = (user, script, situation) => {
  console.log(situation)
  var what
  if (!user) what = <LoginButtons/>
  else what = <PlaySurface
    storage={database().ref(scriptUrl)}
    player={{
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email
    }}
    script={script}
    />
  ReactDOM.render(what, div)
}

if (m = scriptUrl.match(/^gist:(.*)$/)){
  let gistURL = `https://api.github.com/gists/${m[1]}`
  fetch(gistURL).then( result => result.json() ).then( json => {
    let script = json.files["index.bastard"].content
    let user = auth.currentUser
    draw(user, script, 'startDraw')
    auth.onAuthStateChanged(u => draw(u, script, 'onAuthStateChanged'))
  })
} else {
  window.location.href = "http://bastard.zone/#gist:eab2a9dc400869d0dddd8c4f0d479dcb"
}


// auth.signInWithPopup(provider).then(function(result) {
//   // This gives you a Facebook Access Token. You can use it to access the Facebook API.
//   var token = result.credential.accessToken;
//   // The signed-in user info.
//   var user = result.user;
//   // ...
// }).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });





//
// <script>
//   window.fbAsyncInit = function() {
//     FB.init({
//       appId      : '444639452393629',
//       xfbml      : true,
//       version    : 'v2.6'
//     });
//   };
//
//   (function(d, s, id){
//      var js, fjs = d.getElementsByTagName(s)[0];
//      if (d.getElementById(id)) {return;}
//      js = d.createElement(s); js.id = id;
//      js.src = "//connect.facebook.net/en_US/sdk.js";
//      fjs.parentNode.insertBefore(js, fjs);
//    }(document, 'script', 'facebook-jssdk'));
// </script>

// `
//
// "Have an event planned for you by someone else"
// ask some:dreamer ➔idea: what kind of event should someone plan for you?
// charge some:planner: plan @idea for @dreamer?
// charge some:coplanner: coplan @idea with @planner?
// ask* dreamer,planner,coplanner ➔date: whats a good date for @idea?
// charge* whoever: attend @idea on @date, cohosted by @planner and @coplanner?
//
// `



// let deck2 = [
//   {
//     id: 0,
//     type: "ask",
//     text: "what's your idea?",
//     casts: "dreamer",
//     collects: "idea"
//   }, {
//     id: 1,
//     type: "task",
//     text: "plan @idea for @dreamer?",
//     casts: "planner",
//     req: { uncast: 1, after: [0] }
//   }, {
//     id: 2,
//     type: "task",
//     text: "coplan @idea with @planner?",
//     casts: "coplanner"
//     req: { uncast: 1, after: [0,1], }
//   }, {
//     id: 3,
//     type: "confer",
//     text: "what’s a good date for @idea?",
//     collects: "date",
//     req: { after: [0,1,2], only: ["planner", "coplanner", "dreamer"] }
//   }, {
//     id: 4,
//     type: "discuss",
//     text: "attend @idea on @date, cohosted by @planner and @coplanner?",
//     req: { after: [0,1,2,3] }
//   }
// ]

// let exampleRound = {
//   values: {
//     'dreamer': { name: 'Joe', id: 'player12387923' },
//     'idea': "Fan fiction"
//   },
//   cards: [
//     {}...
//   ]
// }
