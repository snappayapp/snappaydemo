import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "../components/Themed";
import { VirtualKeyboard } from "react-native-screen-keyboard";
import { useRequestContext } from "../context";
// import VirtualKeyboard from "react-native-virtual-keyboard";

export default function InsertPayment({ navigation }) {
  const [amount, setAmount] = useState(0);
  const { setShowInput } = useRequestContext();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowInput(true)}>
          <Text>URL</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onKeypress = (key) => {
    console.log("amount", amount);
    if (key !== "back") {
      if (amount === 0) {
        setAmount(amount + key);
      } else {
        setAmount(amount + `${key}`);
      }
    }
    if (key === "back") {
      if (amount.length > 1) {
        setAmount(amount.slice(0, -1));
      } else {
        setAmount(0);
      }
    }

    console.log("key", key);
  };

  const onNav = () => {
    navigation.navigate("Camera", { amount });
  };
  return (
    <>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "#02A9F7", fontSize: 28, marginBottom: 20 }}>
          Enter amount
        </Text>
        <Text
          style={{
            color: "#02A9F7",
            fontSize: 57,
            fontWeight: "700",
            marginBottom: 50,
          }}
          adjustsFontSizeToFit
          allowFontScaling
          numberOfLines={1}
        >
          ₦{amount}
        </Text>
        <VirtualKeyboard
          // onRef={ref => (this.keyboard = ref)}
          onKeyDown={onKeypress}
        />
        {/* <VirtualKeyboard color="white" pressMode="string" onPress={onKeypress} /> */}
        <TouchableOpacity
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#02A9F7",
            padding: 28,
            marginTop: 70,
            borderRadius: 20,
          }}
          onPress={onNav}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: 20,
            }}
          >
            Receive Payment
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
