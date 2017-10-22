port module FirebaseApi exposing (..)

import Utils exposing (..)

type alias UserData =
  { userID : String
  , name : String
  , email : Maybe String
  , photoURL : Maybe String
  , emailVerified : Bool
  }

type alias Error =
  { errCode : String
  , errMsg : String
  }

port signInGoogle : () -> Cmd msg
port signInFacebook : () -> Cmd msg
port signInTwitter : () -> Cmd msg
port signInGithub : () -> Cmd msg
port signOff : () -> Cmd msg
port requestMessagingPermission : () -> Cmd msg
port getMessagingToken : () -> Cmd msg

port userSignedIn : (UserData -> msg) -> Sub msg
port gotUserToken : (String -> msg) -> Sub msg
port noUserSignedIn : (String -> msg) -> Sub msg
port signInError : (Error -> msg) -> Sub msg
port messagingPermissionError : (Error -> msg) -> Sub msg
port messagingTokenAvailable : (String -> msg) -> Sub msg
port noMessagingTokenAvailable : (String -> msg) -> Sub msg
port messagingTokenError : (Error-> msg) -> Sub msg
port getUserTokenError : (Error-> msg) -> Sub msg
port messageReceived : (String -> msg) -> Sub msg

type Msg
  = UserSignedIn UserData
  | GotUserToken String
  | NoUserSignedIn
  | SignInError Error
  | GetUserTokenError Error
  | MsgTokenAvailable String
  | NoMsgTokenAvailable
  | MsgPermissionError Error
  | MsgTokenError Error
  | MessageReceived String

subscriptions : Sub Msg
subscriptions =
  Sub.batch
    [ userSignedIn UserSignedIn
    , gotUserToken GotUserToken
    , noUserSignedIn (const NoUserSignedIn)
    , signInError SignInError
    , getUserTokenError GetUserTokenError
    , messagingPermissionError MsgPermissionError
    , messagingTokenAvailable MsgTokenAvailable
    , noMessagingTokenAvailable (const NoMsgTokenAvailable)
    , messagingTokenError MsgTokenError
    , messageReceived MessageReceived
    ]
