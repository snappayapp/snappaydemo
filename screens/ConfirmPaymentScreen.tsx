import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { psuedoNavigate } from "../App";
import { useRequestContext } from "../context";

export default function ConfirmPaymentScreen() {
  const { amount } = useRequestContext();
  const onConfirm = () => {
    psuedoNavigate("Camera");
  };
  return (
    // <SafeAreaView style={styles.safearea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={onConfirm}>
          <Text style={styles.buttonTextSmall}>
            Press me to confirm payment of
          </Text>
          <Text style={styles.buttonText}>N{amount}</Text>
        </TouchableOpacity>
      </View>
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safearea: {
    backgroundColor: "white",
  },
  container: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginVertical: 20,
    backgroundColor: "#02A9F7",
    padding: 20,
    width: Dimensions.get("screen").width - 100,
    height: Dimensions.get("screen").width - 100,
    borderRadius: Dimensions.get("screen").width - 100 / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 35,
    textAlign: "center",
  },
  buttonTextSmall: {
    color: "white",
    fontWeight: "400",
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
    width: "70%",
  },
});
