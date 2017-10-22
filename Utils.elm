module Utils exposing (..)

const : a -> b -> a
const a b = a

isJust : Maybe a -> Bool
isJust maybeA = case maybeA of
  Nothing -> False
  Just _ -> True
