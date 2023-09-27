import React from "react";
import { Image, ScrollView, TouchableOpacity, Text, View } from "react-native";

import { useRequestContext } from "../context";

export default function PaymentSuccessScreen({ navigation, route }) {
  const { name, amount } = useRequestContext();
  const { paymentData } = route?.params;

  const onNav = () => {
    navigation.navigate("WelcomeScreen");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, height: "100%" }}>
        <View
          style={{
            resizeMode: "contain",
          }}
        >
          <Image
            source={require("../assets/images/logo.png")}
            width={100}
            height={97}
            style={[
              {
                marginVertical: 20,
                alignSelf: "center",
                height: 90,
                width: 200,
              },
            ]}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            backgroundColor: "white",
          }}
        >
          <Image source={require("../assets/images/Transaction.png")} />
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              color: "#02A9F7",
              marginTop: 55,
              fontWeight: "300",
            }}
          >
            Thank you {paymentData?.fullName}, your payment of{" "}
            <Text style={{ fontWeight: "700", color: "#02A9F7" }}>
              ₦{amount}
            </Text>{" "}
            has been received
          </Text>

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
              Another Payment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
