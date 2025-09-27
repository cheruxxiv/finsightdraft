import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // import router

export default function Login() {
  const [form, setForm] = useState({ email_add: "", password: "" });
  const router = useRouter(); // initialize router

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

const handleSubmit = async () => {
  try {
    const res = await fetch("http://172.31.115.200:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("📩 Login response:", data);

    if (res.ok) {
      // If login is successful, navigate to HomePage
      const userId = data.userId || data.user_id; // get userId from response
      if (!userId) {
        Alert.alert("Error", "Login succeeded but no user ID returned.");
        return;
      }

      Alert.alert(
        "Success",
        data.message || "Login successful!",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/Homepage?userId=${userId}`), // navigate to HomePage
          },
        ],
        { cancelable: false }
      );

    } else {
      // Login failed
      Alert.alert("Login Failed", data.message || "Please check your credentials");
    }

  } catch (err) {
    console.error("Login error:", err);
    Alert.alert("Error connecting to server");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={(text) => handleChange("email_add", text)}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        onChangeText={(text) => handleChange("password", text)}
      />
      <Button title="Login" onPress={handleSubmit} />

      <TouchableOpacity
        onPress={() => router.push("/Signup")}style={{ marginTop: 10 }}>
        <Text style={{ color: "blue", textAlign: "center" }}>
          Don't have an account? Signup here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 },
});
