import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { psuedoNavigate } from "../App";
import { useRequestContext } from "../context";

export default function WelcomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [fullname, setFullname] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const {
    setName,
    setAmount,
    enableSpoofingChallenge,
    setEnableSpoofingChallenge,
  } = useRequestContext();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(
          response,
          "notification?.request?.content?.data?.amount",
          response?.notification.request.content.data?.amount
        );
        setAmount(response?.notification.request.content.data?.amount);
        psuedoNavigate("ConfirmPayment");
      }
    );
    return () => subscription.remove();
  }, []);

  const handleFullname = (text: string) => {
    setName(text);
    setFullname(text);
  };

  const toggleSwitch = (value) => {
    console.log("value", value);
  };
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    } else {
      try {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          quality: 0.1,
          base64: true,
        });

        console.log({ ...result, base64: undefined });

        if (!result.cancelled) {
          const dataURL = `${result?.base64}`;
          setImage(dataURL);
        }
      } catch (error) {
        Alert.alert(error?.message);
      }
    }
  };

  const showNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You have a new payment request!",
        body: "Confirm payment of N20,000!",
        data: { amount: 20000 },
      },
      trigger: { seconds: 2 },
    });
  };

  const enrolUser = async () => {
    // setModalVisible(!modalVisible);
    if (fullname.length < 1) {
      Alert.alert("Please enter your full name");
      return;
    }

    if (image === null) {
      Alert.alert("Please enter your full name");
      return;
    }

    await uploadData();
  };

  const uploadData = async () => {
    setEnrolling(true);
    try {
      const resp = await fetch(
        `http://18.130.238.178:5000/api/v1/Identity/bank/enroll`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            bankCode: "01",
            fullname,
            image,
            fcmToken: "fcmToken",
          }),
        }
      );
      const upload = await resp.json();
      setEnrolling(false);
      if (upload) {
        if (upload?.statusCode === 200) {
          Alert.alert("Successfully enrolled");
          setModalVisible(false);
        }
        if (upload?.statusCode === 502) {
          Alert.alert(upload?.errors.join("\n"));
        }
        // psuedoNavigate("PaymentSuccessScreen");
      }
    } catch (error) {
      setEnrolling(false);
      alert(error.message);
      console.log("upload Error", error);
    }
  };

  return (
    // <SafeAreaView style={styles.safearea}>
      <View style={styles.container}>
        <Modal
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <ScrollView>
            <View style={styles.centeredView}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/logo.png")}
                  width={100}
                  height={97}
                  style={[styles.logo, { width: 100 }]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={{ width: "100%" }}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <Text style={{ textAlign: "right" }}>Close</Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: "100%",
                    marginBottom: 16,
                  }}
                >
                  {image && (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${image}` }}
                      style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                  )}
                </View>
                <TouchableOpacity style={styles.chooseImg} onPress={pickImage}>
                  <Text>{image ? "Replace Image" : "Choose Image"}</Text>
                </TouchableOpacity>

                <View style={{ width: "100%" }}>
                  <Text style={{ marginBottom: 8 }}>Full name</Text>
                  <TextInput
                    style={styles.textInput}
                    onChangeText={handleFullname}
                    value={fullname}
                  />
                </View>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={enrolUser}
                >
                  <Text style={styles.textStyle}>
                    {enrolling && (
                      <ActivityIndicator animating={enrolling} color="white" />
                    )}
                    Submit
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </Modal>

        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            width={100}
            height={97}
            style={[styles.logo]}
            resizeMode="contain"
          />
        </View>
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Enrol</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={showNotification}>
            <Text style={styles.buttonText}>Show Notification</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Switch
            onValueChange={setEnableSpoofingChallenge}
            value={enableSpoofingChallenge}
          />
          <Text style={{ marginLeft: 10 }}>Enable Spoofing Challenge</Text>
        </View>
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
    justifyContent: "space-around",
  },
  logoContainer: {
    resizeMode: "contain",
  },
  logo: {
    marginVertical: 20,
    alignSelf: "center",
    height: 90,
    width: 200,
  },
  button: {
    marginVertical: 20,
    backgroundColor: "#02A9F7",
    padding: 20,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  textInput: {
    borderWidth: 1,
    width: "100%",
    height: 48,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: "#a9a8a8",
  },
  //
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    width: "80%",
    alignSelf: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },

  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    width: "100%",
    borderRadius: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  chooseImg: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderRadius: 10,
    borderColor: "#a9a8a8",
  },
});
