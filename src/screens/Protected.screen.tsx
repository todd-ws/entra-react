// src/screens/Protected.screen.tsx
import React from "react";
import { View, Text } from "react-native";

export default function ProtectedScreen() {
  return (
    <View style={{ gap: 8, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Protected Area</Text>
      <Text>If you can see this, you’re authenticated ✅</Text>
    </View>
  );
}
