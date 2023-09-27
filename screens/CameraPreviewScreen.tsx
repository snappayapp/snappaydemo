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

export default function CameraPreviewScreen({ navigation, route }) {
  const { uri } = route.params;
  return <ImageBackground source={{ uri }} style={StyleSheet.absoluteFill} />;
}
