// src/App.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import MsalProviderGate from "./auth/MsalProviderGate";
import HomeScreen from "./screens/Home.screen";
import ProtectedScreen from "./screens/Protected.screen";
import { withAuthGuard } from "./auth/withAuthGuard";

const GuardedProtected = withAuthGuard(ProtectedScreen);

export default function App() {
  const [route, setRoute] = React.useState<"home" | "protected">("home");

  return (
    <MsalProviderGate>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={() => setRoute("home")}><Text>Home</Text></Pressable>
          <Pressable onPress={() => setRoute("protected")}><Text>Protected</Text></Pressable>
        </View>
        {route === "home" ? <HomeScreen /> : <GuardedProtected />}
      </View>
    </MsalProviderGate>
  );
}
