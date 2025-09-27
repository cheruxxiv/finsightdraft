import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function VerifyOTP() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const numericUserId = Number(userId);

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert("Missing Info", "Please enter the OTP.");
      return;
    }

    try {
      const res = await fetch("http://172.31.115.200:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: numericUserId, otp_code: otp }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", data.message || "OTP verified!");
        router.push(`/BudgetingCheckIn?userId=${numericUserId}`);
      } else {
        Alert.alert("Verification Failed", data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      Alert.alert("Error", "Failed to connect to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>

      <TextInput
        placeholder="Enter OTP"
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />

      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 15 },
});
