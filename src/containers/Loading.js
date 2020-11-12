import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { firebase } from "../firebase/Config";
import { useDispatch, useSelector } from "react-redux";
import * as authActions from "../actions/Auth";
import * as booksActions from "../actions/Books";
import * as socialActions from "../actions/Social";
import Spinner from "../components/Spinner";

function Loading(props) {
  const dispatch = useDispatch();
  const database = firebase.firestore();
  const userInState = useSelector((state) => state.auth.user);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user && !userInState) {
        database
          .collection("users")
          .doc(user.uid)
          .get()
          .then(function (response) {
            const responseData = response.data();
            dispatch(authActions.login(responseData));
            let favoriteBooksFromDB = responseData.favoriteBooks;
            let favoriteBooks = {};
            favoriteBooksFromDB.forEach((favoriteBook) => {
              favoriteBooks[favoriteBook.bookID] = favoriteBook.book;
            });
            dispatch(booksActions.setFavoriteBooks(favoriteBooks));
            let collectionFromDB = responseData.collection;
            let collection = {};
            collectionFromDB.forEach((item) => {
              collection[item.bookID] = item.book;
            });
            dispatch(booksActions.setCollection(collection));
            let friendsFromDB = responseData.friends;
            let friends = {};
            friendsFromDB.forEach((item) => {
              friends[item.uid] = item.friend;
            });
            dispatch(socialActions.setFriends(friends));
            props.navigation.navigate("MainNavigator");
          })
          .catch(function (error) {
            console.error(error);
          });
        // props.navigation.navigate("MainNavigator");
      } else {
        console.log("logout");
        props.navigation.navigate("Login");
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Loading</Text>
      <Spinner
        size={Platform.OS === "android" ? 10 : "large"}
        color={Platform.OS === "android" ? "#448aff" : undefined}
      />
    </View>
  );
}

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
