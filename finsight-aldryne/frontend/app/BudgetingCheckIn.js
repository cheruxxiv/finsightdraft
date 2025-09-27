import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import RadioGroup from "react-native-radio-buttons-group";
import { useLocalSearchParams, useRouter } from "expo-router"; // ✅ Add useRouter import

export default function BudgetingCheckIn() {
  const { userId } = useLocalSearchParams();
  const router = useRouter(); // ✅ Initialize router
  const numericUserId = Number(userId); // ensure it's a number

  useEffect(() => {
    console.log("🔍 Received userId from navigation:", userId);
    console.log("🔍 Parsed numericUserId:", numericUserId);
  }, [userId]);

  const [descriptionId, setDescriptionId] = useState(null);
  const [challengeId, setChallengeId] = useState(null);
  const [spendingId, setSpendingId] = useState(null);
  const [confidenceId, setConfidenceId] = useState(null);

  const descriptionButtons = [
    { id: "student", label: "Student", value: "student" },
    { id: "employee", label: "Employee / Working", value: "employee" },
    { id: "unemployed", label: "Unemployed", value: "unemployed" },
  ];

  const challengeButtons = [
    { id: "overspending", label: "Overspending", value: "overspending" },
    { id: "saving", label: "Saving", value: "saving" },
    { id: "tracking", label: "Tracking Expenses", value: "tracking" },
  ];

  const spendingButtons = [
    { id: "essentials", label: "Essentials (food, bills)", value: "essentials" },
    { id: "wants", label: "Wants (shopping, entertainment)", value: "wants" },
    { id: "savings", label: "Savings", value: "savings" },
  ];

  const confidenceButtons = [
    { id: "10", label: "Very confident", value: 10 },
    { id: "5", label: "Somewhat confident", value: 5 },
    { id: "1", label: "Not confident at all", value: 1 },
  ];

const handleSubmit = async () => {
  const description = descriptionButtons.find(b => b.id === descriptionId)?.value;
  const challenge = challengeButtons.find(b => b.id === challengeId)?.value;
  const spending = spendingButtons.find(b => b.id === spendingId)?.value;
  const confidence = confidenceButtons.find(b => b.id === confidenceId)?.value;

  if (!description || !challenge || !spending || !confidence) {
    Alert.alert("Missing Info", "Please answer all questions before proceeding.");
    return;
  }

  if (!numericUserId) {
    Alert.alert("Error", "User ID is missing. Please log in again.");
    return;
  }

  const payload = {
    user_id: numericUserId,
    user_description: description,
    budgeting_challenges: challenge,
    spending_priority: spending,
    confidence_level: confidence,
  };

  try {
    const res = await fetch("http://172.31.115.200:5000/budget-checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected server response: ${text}`);
    }

    console.log("✅ Server response:", data);

    // ✅ Show success alert AND navigate to HomePage
    Alert.alert(
      "Success",
      data.message || "Check-in saved!",
      [
        {
          text: "OK",
          onPress: () => router.push(`/Homepage?userId=${numericUserId}`), // ✅ Now router is properly imported
        },
      ],
      { cancelable: false }
    );

  } catch (err) {
    console.error("❌ Check-in error:", err);
    Alert.alert("Error", err.message || "Failed to connect to server");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budgeting Check-In</Text>

      <Text style={styles.question}>Which of these best describes you?</Text>
      <RadioGroup
        radioButtons={descriptionButtons}
        selectedId={descriptionId}
        onPress={setDescriptionId}
      />

      <Text style={styles.question}>What is your biggest challenge in budgeting?</Text>
      <RadioGroup
        radioButtons={challengeButtons}
        selectedId={challengeId}
        onPress={setChallengeId}
      />

      <Text style={styles.question}>What do you usually spend the most on?</Text>
      <RadioGroup
        radioButtons={spendingButtons}
        selectedId={spendingId}
        onPress={setSpendingId}
      />

      <Text style={styles.question}>How confident are you in achieving your financial goals?</Text>
      <RadioGroup
        radioButtons={confidenceButtons}
        selectedId={confidenceId}
        onPress={setConfidenceId}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Proceed" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  question: { fontSize: 18, marginVertical: 10 },
});