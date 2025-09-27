import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email_add: "",
    password: "",
    confirm_password: ""
  });

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleSubmit = async () => {
    const { full_name, email_add, password, confirm_password } = form;

    // 1. Check password match
    if (password !== confirm_password) {
      Alert.alert("Password mismatch", "The passwords you entered do not match.");
      return;
    }

    // 2. Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long and include:\n- 1 uppercase letter\n- 1 lowercase letter\n- 1 number\n- 1 special character"
      );
      return;
    }

    try {
      const res = await fetch("http://172.31.115.200:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email_add, password }),
      });

      const data = await res.json();
      console.log("📩 Signup response:", data);

      if (res.ok) {
        const userId = data.userId || data.user_id;
        if (!userId) {
          Alert.alert("Error", "Signup succeeded but no userId returned.");
          return;
        }

        Alert.alert("Success", data.message || "Signup successful!");

        // Navigate to VerifyOTP with userId param
        router.push({
          pathname: "/VerifyOTP",
          params: { userId: String(userId) },
        });
      } else {
        Alert.alert("Signup Failed", data.message || "Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      Alert.alert("Error connecting to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        onChangeText={text => handleChange("full_name", text)}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={text => handleChange("email_add", text)}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        onChangeText={text => handleChange("password", text)}
      />
      <TextInput
        placeholder="Confirm Password"
        style={styles.input}
        secureTextEntry
        onChangeText={text => handleChange("confirm_password", text)}
      />

      <Button title="Register" onPress={handleSubmit} />

      <TouchableOpacity onPress={() => router.push("/Login")} style={{ marginTop: 10 }}>
        <Text style={{ color: "blue", textAlign: "center" }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 }
});
