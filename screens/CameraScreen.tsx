import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { decode as atob, encode as btoa } from "base-64";
import { isEmpty, delay } from "lodash";

import { Camera, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

import FadeInOut from "react-native-fade-in-out";

import { Text, View } from "../components/Themed";
import { useRequestContext } from "../context";
import { psuedoNavigate } from "../App";

const OPEN_THRESHOLD = 0.85;
const CLOSE_THROESHOLD = 0.4;

const SMILING_THRESHOLD = 0.85;
const NOT_SMIlING_THRESHOLD = 0.4;

export default function CameraScreen({ navigation, route }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [faces, setFaces] = useState<FaceDetectionResult["faces"]>([]);
  const [faceDetected, setFacesDetected] = useState<
    FaceDetectionResult["faces"]
  >([]);
  const [mounted, setMounted] = useState(true);
  const [startedTakingPicture, setStartedTakingPicture] = useState(false);

  const cameraRef: { current: any } = useRef();
  const [previewImage, setpreviewImage] = useState({ visible: false, uri: "" });
  const [detectedFace, setDetectedFace] = useState(false);
  const [smileDetected, setSmileDetected] = useState(false);

  const [showChallenge, setShowChallenge] = useState(false);

  const [uploading, setUploading] = useState(false);

  const interval: { current: any } = useRef(null);
  const [countDown, setCountDown] = useState(2);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const { enableSpoofingChallenge } = useRequestContext();

  const cancelCountDown = () => {
    clearInterval(interval.current);
    interval.current = null;
    if (mounted) {
      setIsCountingDown(false);
    }
  };

  const intializeCountDown = async () => {
    if (mounted) {
      if (countDown > 0) {
        setIsCountingDown(true);
        interval.current = setInterval(() => {
          setCountDown((prev) => prev - 1);
        }, 1000);
      } else {
        if (enableSpoofingChallenge) {
          setShowChallenge(true);
        } else {
          await takePicture();
        }
      }
    }
  };

  const takePicture = async () => {
    const pictureTaken = await cameraRef.current?.takePictureAsync({
      base64: true,
      quality: 0.1,
    });
    if (pictureTaken) {
      cancelCountDown();
      // console.log("pictureTaken", pictureTaken);
      if (mounted) {
        setpreviewImage({ visible: true, uri: pictureTaken.uri });
        uploadData(pictureTaken.base64);
      }
    }
  };

  useEffect(function initMounted() {
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(
    function initiateCountdown() {
      /**
       * if faces exist and has data,
       * initiate countdown or else cancel the down
       */
      if (!isEmpty(faces)) {
        intializeCountDown();
      } else {
        cancelCountDown();
      }

      return () => {
        /**
         * When the page unmount clear the interval
         */
        clearInterval(interval.current);
      };
    },
    [faces, countDown]
  );

  /**
   * Request for camera permissions
   */
  useEffect(function requestCameraPermission() {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (mounted) {
        setHasPermission(status === "granted");
      }
    })();
  }, []);

  /**
   * If smileDetected changes, if true, wait for 500ms and take picture
   */
  useEffect(
    function actionWhenSmileDetected() {
      console.log("smileDetected", smileDetected);

      if (smileDetected) {
        delay(async () => await takePicture(), 200);
      }
    },
    [smileDetected]
  );

  /**
   *
   * @param faces
   */
  const detectSmile = (faces: FaceDetectionResult["faces"]) => {
    if (!smileDetected) {
      faces.forEach((face) => {
        if (mounted) {
          if (face.smilingProbability > SMILING_THRESHOLD) {
            setSmileDetected(true);
          } else if (face.smilingProbability < NOT_SMIlING_THRESHOLD) {
            setSmileDetected(false);
          }
        }
      });
    }
  };

  /**
   *
   * @param faceParam
   */
  const handleFacesDetected = async ({ faces }: FaceDetectionResult) => {
    if (mounted) {
      /**
       * Set faces we have detected for the sake of record keeping
       */
      setFacesDetected(faces);
      console.log("faces", faces);

      /**
       * If faces exist or not, we want to set it to state
       */
      if (!isEmpty(faces)) {
        setDetectedFace(true);
      }

      /**
       * We only want to set faces if we have not detected the faces
       */
      if (!detectedFace) {
        setFaces(faces);
      }

      /**
       * When the challenge pops up, we want to detect if the user is smiling
       */
      if (showChallenge) {
        delay(() => detectSmile(faces), 200);
      }
    }

    // faces.forEach((face) => {
    //   if (face?.faceID !== currentFaceID) {
    //     setCurrentFaceID(face.faceID);
    //   }

    //   if (face?.faceID === currentFaceID) {
    //     if (
    //       face?.leftEyeOpenProbability > OPEN_THRESHOLD &&
    //       face?.rightEyeOpenProbability > OPEN_THRESHOLD
    //     ) {
    //       // Both eyes open
    //       setBlinkState(1);
    //     }

    //     if (
    //       face?.leftEyeOpenProbability < CLOSE_THROESHOLD &&
    //       face?.rightEyeOpenProbability < CLOSE_THROESHOLD
    //     ) {
    //       //Both eyes closed
    //       setBlinkState(2);
    //     }

    //     if (
    //       face?.leftEyeOpenProbability > OPEN_THRESHOLD &&
    //       face?.rightEyeOpenProbability > OPEN_THRESHOLD
    //     ) {
    //       //Both eyes closed
    //       setBlinkState(0);

    //       //   setUserBlinked(true);
    //       //   Alert.alert("You blinked!");
    //       //   if (!userBlinked) {
    //       //   }
    //     }
    //   }
    // });
  };

  function DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(",");
    const byteString =
      splitDataURI[0].indexOf("base64") >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(":")[1].split(";")[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  const uploadData = async (base64: string) => {
    if (mounted) {
      setUploading(true);
      try {
        const resp = await fetch(
          `http://18.130.238.178:5000/api/v1/Identity/bank/getenrollee`,
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              image: base64,
              bankCode: "01",
            }),
          }
        );
        const upload = await resp.json();
        if (upload) {
          console.log("upload response", upload);
          if (upload?.statusCode === 200) {
            psuedoNavigate("PaymentSuccess", {
              paymentData: upload?.data,
            });
          } else {
            Alert.alert(upload?.errors.join("\n"));
          }
        }
        setUploading(false);
      } catch (error) {
        setUploading(false);
        alert(error.message);
        console.log("upload Error", error);
      }
    }
  };

  const handleCancelPreview = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraCover}>
        <View
          style={{
            resizeMode: "contain",
            backgroundColor: "white",
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
                width: 150,
              },
            ]}
            resizeMode="contain"
          />
        </View>
        {!previewImage.visible ? (
          <Camera
            style={styles.camera}
            type={type}
            onFacesDetected={handleFacesDetected}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.accurate,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
              runClassifications: FaceDetector.FaceDetectorClassifications.all,
              minDetectionInterval: 100,
              tracking: true,
              faceID: true,
            }}
            autoFocus
            focusDepth={1}
            ref={cameraRef}
            flashMode="on"
          >
            {faceDetected.map((face, index) => (
              <View
                style={{
                  position: "absolute",
                  borderWidth: 1,
                  borderColor: "yellow",
                  backgroundColor: "transparent",
                  height: face.bounds.size.height,
                  width: face.bounds.size.width,
                  top: face.bounds.origin.y,
                  left: face.bounds.origin.x,
                }}
                key={index}
              />
            ))}

            {isCountingDown && !showChallenge && (
              <View style={styles.countDownContainer}>
                <Text style={styles.countDownText}>{countDown}</Text>
              </View>
            )}
            <FadeInOut visible={showChallenge} duration={500}>
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 40,
                    textAlign: "center",
                  }}
                >
                  Smile 🙂 {"\n"} to continue
                </Text>
              </View>
            </FadeInOut>
          </Camera>
        ) : (
          <View style={{ height: "50%" }}>
            <TouchableOpacity
              style={{ position: "absolute", top: 25, left: 25, zIndex: 100 }}
              onPress={handleCancelPreview}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
            <ImageBackground
              source={{ uri: previewImage.uri }}
              style={styles.preview}
            >
              <View style={styles.countDownContainer}>
                <ActivityIndicator
                  animating={uploading}
                  size="large"
                  color="white"
                />
              </View>
            </ImageBackground>
          </View>
        )}
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    width: "80%",
    height: "50%",
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  cameraCover: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  countDownContainer: {
    position: "absolute",
    zIndex: 100,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  countDownText: {
    fontSize: 40,
    fontWeight: "700",
    color: "white",
  },
  preview: {
    width: Dimensions.get("screen").width - 100,
    height: "100%",
    resizeMode: "contain",
    backgroundColor: "red",
  },
});
