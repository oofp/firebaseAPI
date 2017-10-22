
var config = {
  apiKey: "AIzaSyAFFjDF9FV1HCoRH7mt_wF2RbEymxbJ4VY",
  authDomain: "vulive-f7ca8.firebaseapp.com",
  databaseURL: "https://vulive-f7ca8.firebaseio.com",
  projectId: "vulive-f7ca8",
  storageBucket: "vulive-f7ca8.appspot.com",
  messagingSenderId: "442900896633"
};

function initFirebase(elmApp) {
  firebase.initializeApp(config);

  var messaging = firebase.messaging();
  messaging.onMessage(function(payload) {
    console.log("Firebase message received. ", payload);
    elmApp.ports.messageReceived.send(JSON.stringify(payload.data));
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Authenticated user:"+JSON.stringify(user))

      var userData =
        { userID : user.uid
        , name : user.displayName
        , emailVerified : user.emailVerified
        }

      if (user.email) {// User is signed in
        userData.email=user.email;
        if (!userData.name) {
          userData.name=user.email;
        }
      } else {
        userData.email=null;
      }


      if (user.photoURL) {// User is signed in
        userData.photoURL=user.photoURL;
      } else {
        userData.photoURL=null;
      }

      if (user.providerData && user.providerData[0].providerId=="facebook.com") {
        userData.photoURL="https://graph.facebook.com/" + user.providerData[0].uid + "/picture?type=large";
      }

      elmApp.ports.userSignedIn.send(userData);

      user.getIdToken(/* forceRefresh */ true).then(function(idToken) {
        elmApp.ports.gotUserToken.send(idToken);
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        elmApp.ports.getUserTokenError.send(
          { errCode : errorCode
          , errMsg : errorMessage
          }
        );
      });
    } else {
      elmApp.ports.noUserSignedIn.send("");
    }
  });

  elmApp.ports.signInGoogle.subscribe(function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      //expect onAuthStateChanged to be triggered
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;
      elmApp.ports.signInError.send(
        { errCode : errorCode
        , errMsg : errorMessage
        }
      );
    }); //catch
  }); //signInGoogle subscribe

  elmApp.ports.signInFacebook.subscribe(function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      //expect onAuthStateChanged to be triggered
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;
      elmApp.ports.signInError.send(
        { errCode : errorCode
        , errMsg : errorMessage
        }
      );
    }); //catch
  }); //signInGoogle subscribe

  elmApp.ports.signInTwitter.subscribe(function() {
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
      //expect onAuthStateChanged to be triggered
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;
      elmApp.ports.signInError.send(
        { errCode : errorCode
        , errMsg : errorMessage
        }
      );
    }); //catch
  }); //signInGoogle subscribe

  elmApp.ports.signInGithub.subscribe(function() {
    var provider = new firebase.auth.GithubAuthProvider();
    //provider.addScope('gist');

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("signInGithub entered:"+user)
      // ...
      //expect onAuthStateChanged to be triggered
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      //var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      //var credential = error.credential;
      elmApp.ports.signInError.send(
        { errCode : errorCode
        , errMsg : errorMessage
        }
      );
    }); //catch
  }); //signInGoogle subscribe

  elmApp.ports.requestMessagingPermission.subscribe(function() {
    var messaging = firebase.messaging();
    messaging.requestPermission()
    .then(function() {
      console.log('Notification permission granted.');
      // Retrieve an Instance ID token for use with FCM.
      queryMessagingToken(elmApp,false);
    })
    .catch(function(error) {
      console.log('Unable to get permission to notify.', error);
      var errorCode = error.code;
      var errorMessage = error.message;
      elmApp.ports.messagingPermissionError.send(
        { errCode : errorCode
        , errMsg : errorMessage
        }
      );
    });
  });

  elmApp.ports.getMessagingToken.subscribe(function() {
    queryMessagingToken(elmApp);
  });

  elmApp.ports.signOff.subscribe(function() {
    firebase.auth().signOut();
  });

  var messaging = firebase.messaging();
  messaging.onTokenRefresh(function() {
    console.log('onTokenRefresh entered');
    queryMessagingToken(elmApp);
  });
}

function queryMessagingToken(elmApp) {
  var messaging = firebase.messaging();
  messaging.getToken()
    .then(function(currentToken) {
      if (currentToken) {
        elmApp.ports.messagingTokenAvailable.send(currentToken);
      } else {
        // Show permission request.
        console.log('No Instance ID token available');
        elmApp.ports.noMessagingTokenAvailable.send("No message token available");
      }
    })
    .catch(function(error) {
      console.log('An error occurred while retrieving token. ', error);
      var errorCode = error.code;
      var errorMessage = error.message;
      elmApp.ports.messagingTokenError.send(
        { errCode : errorCode
        , errMsg : errorMessage
        }
      );
    });
};
