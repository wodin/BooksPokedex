import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Button } from "react-native";
import { firebase } from "../firebase/Config";
import { useDispatch } from "react-redux";
import * as authActions from "../actions/Auth";
import User from "../entities/User";

function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();
  const database = firebase.firestore();

  const handleSignUp = async () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        let uid = firebase.auth().currentUser.uid;
        database
          .collection("users")
          .doc(uid)
          .set({
            uid: uid,
            firstName: "firstName",
            lastName: "lastName",
            gender: "gender",
            email: email,
          })
          .then(function () {
            console.log("Document successfully written!");
            dispatch({
              type: authActions.SIGNUP,
              user: new User(uid, "firstName", "lastName", "gender", email)
            });
            props.navigation.navigate("Main");
          })
          .catch(function (error) {
            console.error("Error writing document: ", error);
          });
      })
      .catch((error) => setErrorMessage(error.message));
  };

  return (
    <View style={styles.container}>
      <Text>Sign Up</Text>
      {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        style={styles.textInput}
        onChangeText={(email) => setEmail(email)}
        value={email}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        autoCapitalize="none"
        style={styles.textInput}
        onChangeText={(password) => setPassword(password)}
        value={password}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button
        title="Already have an account? Login"
        onPress={() => props.navigation.navigate("Login")}
      />
    </View>
  );
}

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8,
  },
});
