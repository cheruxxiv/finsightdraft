import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AddWallet() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const numericUserId = Number(userId);

  const [walletName, setWalletName] = useState("");

  // Wallet type dropdown
  const [walletTypeOpen, setWalletTypeOpen] = useState(false);
  const [walletTypeValue, setWalletTypeValue] = useState("Cash");
  const [walletTypeItems, setWalletTypeItems] = useState([
    { label: "Cash", value: "Cash" },
    { label: "Bank", value: "Bank" },
    { label: "E-Wallet", value: "E-Wallet" },
    { label: "Savings", value: "Savings" },
    { label: "Other", value: "Other" },
  ]);

  const handleSave = async () => {
    const trimmedWalletName = walletName.trim();
    const finalWalletType = walletTypeValue?.trim() || "Cash";

    if (!trimmedWalletName) {
      alert("Please enter wallet name");
      return;
    }

    if (!finalWalletType) {
      alert("Please select wallet type");
      return;
    }

    try {
      const res = await fetch("http://192.168.68.101:5000/add-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: numericUserId,
          wallet_name: trimmedWalletName,
          wallet_type: finalWalletType,
        }),
      });

      const data = await res.json();

if (res.ok) {
  alert("Wallet added successfully!");
  router.replace(`/Homepage?userId=${numericUserId}`);
}


    } catch (err) {
      console.error(err);
      alert("Error adding wallet");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADD WALLET</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Wallet Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter wallet name"
          value={walletName}
          onChangeText={setWalletName}
        />

        <Text style={styles.label}>Wallet Type</Text>
        <DropDownPicker
          open={walletTypeOpen}
          value={walletTypeValue}
          items={walletTypeItems}
          setOpen={setWalletTypeOpen}
          setValue={setWalletTypeValue}
          setItems={setWalletTypeItems}
          placeholder="Select Wallet Type"
          dropDownContainerStyle={styles.dropdownContainer}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          zIndex={1000}
          zIndexInverse={1000}
          ArrowDownIconComponent={({ style }) => <Ionicons name="chevron-down" size={18} color="#333" style={style} />}
          ArrowUpIconComponent={({ style }) => <Ionicons name="chevron-up" size={18} color="#333" style={style} />}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#00B14F", marginBottom: 25, textAlign: "center" },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  label: { fontSize: 14, color: "#555", marginBottom: 8, fontWeight: "600" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    marginBottom: 20,
    borderRadius: 10,
  },
  dropdownContainer: { backgroundColor: "#fff", borderColor: "#ccc" },
  dropdownText: { fontSize: 16 },
  saveButton: {
    backgroundColor: "#00B14F",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#00B14F",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});