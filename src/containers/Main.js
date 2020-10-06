import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  Button,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Icon } from "react-native-elements";
import { firebase } from "../firebase/Config";
import { useDispatch, useSelector } from "react-redux";
import * as authActions from "../actions/Auth";
import * as booksActions from "../actions/Books";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { createStackNavigator } from "@react-navigation/stack";
import Book from "./Book";
import { TouchableRipple } from "react-native-paper";

const Stack = createStackNavigator();

function MyBooks(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [books, setBooks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const database = firebase.firestore();

  const user = useSelector((state) => state.auth.user);
  const historyBooks = useSelector((state) => state.books.historyBooks);
  useEffect(() => {
    setCurrentUser(firebase.auth().currentUser);
    if (historyBooks) {
      console.log(historyBooks);
      setBooks(historyBooks);
      setIsLoading(false);
    } else {
      console.log("else");
      fetch(
        "https://www.googleapis.com/books/v1/volumes?q=subject:history&maxResults=20&key=AIzaSyAyH7CvHZd5lhtiXXVcxdUliGTOwxxMkZc",
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          let googleBooks = [];
          console.log(responseJson);
          responseJson.items.forEach((book) => {
            googleBooks.push(book.volumeInfo);
          });
          dispatch(booksActions.setHistoryBooks(googleBooks));
          setBooks(googleBooks);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch(authActions.logout());
        props.navigation.navigate("Loading");
      })
      .catch((error) => setErrorMessage(error.message));
  };

  const onBookPress = (book) => {
    dispatch(booksActions.setCurrentBook(book));
    props.navigation.navigate("Book Info");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Books</Text>
      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => {
          console.log("plusPress");
        }}
      >
        <FontAwesome name="plus" color="#ffffff" size={24} />
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading</Text>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <SafeAreaView style={styles.booksScrollView}>
          <FlatList
            data={books}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.title}
                style={{ marginLeft: 5, marginBottom: 5 }}
                onPress={() => onBookPress(item)}
              >
                <View>
                  <Image
                    style={{ height: 200, width: 150 }}
                    source={{
                      uri: item.imageLinks.thumbnail,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            )}
            numColumns={2}
            columnWrapperStyle={{
              display: "flex",
              justifyContent: "space-evenly",
              marginBottom: 10,
            }}
            keyExtractor={(item) => item.title}
            onEndReached={(dis) => {
              console.log(dis);
              if (dis.distanceFromEnd < 0) {
                return;
              }
              setBooks((data) => {
                return [...data, ...data];
              });
            }}
            onEndReachedThreshold={0.1}
          />
        </SafeAreaView>
      )}

      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  booksContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  booksScrollView: {
    height: Dimensions.get("window").height * 0.75,
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
  plusButton: {
    position: "absolute",
    top: 17,
    right: 10,
  },
  title: {
    paddingTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    width: "100%",
    backgroundColor: "#ff4336",
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
    height: Dimensions.get("window").height * 0.08,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height * 0.8,
    backgroundColor: "pink",
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
  rightIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: 120,
  },
  roundIcon: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

function Main(props) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="My Books" component={MyBooks} />
      <Stack.Screen
        name="Book Info"
        component={Book}
        options={{
          headerRight: (props) => (
            <View style={styles.rightIconsContainer}>
              <TouchableRipple
                onPress={() => console.log("search")}
                rippleColor="rgba(0, 0, 0, .32)"
                style={styles.roundIcon}
                borderless={true}
                centered={true}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    type="ionicon"
                    name={Platform.OS === "ios" ? "ios-search" : "md-search"}
                  />
                </View>
              </TouchableRipple>
              <TouchableRipple
                onPress={() => console.log("like")}
                rippleColor="rgba(0, 0, 0, .32)"
                style={styles.roundIcon}
                borderless={true}
                centered={true}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    type="ionicon"
                    name={Platform.OS === "ios" ? "ios-heart" : "md-heart"}
                  />
                </View>
              </TouchableRipple>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
