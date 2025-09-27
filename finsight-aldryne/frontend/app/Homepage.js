import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function Homepage() {
  const [userName, setUserName] = useState("User");
  const [wallets, setWallets] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [greeting, setGreeting] = useState("Hello");
  const [activeTab, setActiveTab] = useState("wallets");

  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const numericUserId = Number(userId);

  // Greeting logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 18) setGreeting("Good afternoon");
    else if (hour >= 18 && hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!numericUserId) return;

      // Fetch user
      fetch(`http://172.31.115.200:5000/user?user_id=${numericUserId}`)
        .then(res => res.json())
        .then(data => setUserName(data.full_name || data.name || "User"))
        .catch(() => setUserName("User"));

      // Fetch wallets
      fetch(`http://172.31.115.200:5000/wallets?user_id=${numericUserId}`)
        .then(res => res.json())
        .then(data => setWallets(Array.isArray(data) ? data : []))
        .catch(() => setWallets([]));

      // Fetch credit cards
      fetch(`http://172.31.115.200:5000/credit-cards?user_id=${numericUserId}`)
        .then(res => res.json())
        .then(data => setCreditCards(Array.isArray(data) ? data : []))
        .catch(() => setCreditCards([]));
    }, [numericUserId])
  );

  // Handler for wallet card press
  const handleWalletPress = (wallet) => {
    // Navigate to wallet details page, passing both userId and walletId
    router.push(`/WalletDetails?userId=${numericUserId}&walletId=${wallet.wallet_id}`);
  };

  // Handler for credit card press
  const handleCreditCardPress = (card) => {
    // Navigate to credit card details page
    router.push(`/CreditCardDetails?userId=${numericUserId}&cardId=${card.credit_wallet_id}`);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {/* Greeting */}
        <Text style={styles.greeting}>{greeting}, {userName}!</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "wallets" && styles.activeTab]}
            onPress={() => setActiveTab("wallets")}
          >
            <Text style={[styles.tabText, activeTab === "wallets" && styles.activeTabText]}>
              Wallets
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "creditCards" && styles.activeTab]}
            onPress={() => setActiveTab("creditCards")}
          >
            <Text style={[styles.tabText, activeTab === "creditCards" && styles.activeTabText]}>
              Credit Cards
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wallets Content */}
        {activeTab === "wallets" && (
          <View>
            {wallets.length === 0 ? (
              // Blank state
              <View style={styles.blankState}>
                <Text style={styles.blankTitle}>No wallets yet</Text>
                <Text style={styles.blankSubtitle}>
                  Create your first wallet to start tracking your money!
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push(`/AddWallet?userId=${numericUserId}`)}
                >
                  <Text style={styles.addButtonText}>+ Add Wallet</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Show wallets
              <View>
                {wallets.map(wallet => (
                  <TouchableOpacity
                    key={wallet.wallet_id}
                    style={styles.card}
                    onPress={() => handleWalletPress(wallet)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>
                        {wallet.wallet_name} ({wallet.wallet_type})
                      </Text>
                      <Text style={styles.cardText}>Budget: ₱{wallet.total_budget?.toLocaleString() || 0}</Text>
                      <Text style={styles.cardText}>Income: ₱{wallet.total_income?.toLocaleString() || 0}</Text>
                      <Text style={styles.cardText}>
                        Remaining: ₱
                        {(wallet.total_income - wallet.total_budget).toLocaleString() || 0}
                      </Text>
                    </View>
                    <View style={styles.cardArrow}>
                      <Text style={styles.arrowText}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push(`/AddWallet?userId=${numericUserId}`)}
                >
                  <Text style={styles.addButtonText}>+ Add Wallet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Credit Cards Content */}
        {activeTab === "creditCards" && (
          <View>
            {creditCards.map(card => (
              <TouchableOpacity
                key={card.credit_wallet_id}
                style={styles.card}
                onPress={() => handleCreditCardPress(card)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {card.card_provider} •••• {card.card_number_last4}
                  </Text>
                  <Text style={styles.cardText}>Billing Date: {card.billing_date}</Text>
                  <Text style={styles.cardText}>Due Date: {card.due_date}</Text>
                  <Text style={styles.cardText}>Credit Limit: ₱{card.credit_limit?.toLocaleString()}</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push(`/CreditCard/AddCreditCard?userId=${numericUserId}`)}
            >
              <Text style={styles.addButtonText}>+ Add Credit Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Ribbon */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push(`/Transactions?userId=${numericUserId}`)}
        >
          <Text style={styles.navButtonText}>TRANSACTIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push(`/SavingsJar?userId=${numericUserId}`)}
        >
          <Text style={styles.navButtonText}>SAVINGS JAR</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push(`/ReceiptScanner?userId=${numericUserId}`)}
        >
          <Text style={styles.navButtonText}>RECEIPT SCANNER</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push(`/ChatBot?userId=${numericUserId}`)}
        >
          <Text style={styles.navButtonText}>AI CHATBOT</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push(`/Profile?userId=${numericUserId}`)}
        >
          <Text style={styles.navButtonText}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#333" },
  tabs: { flexDirection: "row", marginBottom: 15 },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ccc",
    alignItems: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  activeTab: { backgroundColor: "#00B14F" },
  tabText: { color: "#333", fontWeight: "600" },
  activeTabText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  cardText: { 
    fontSize: 14, 
    color: "#666",
    marginBottom: 2,
  },
  cardArrow: {
    marginLeft: 10,
    paddingLeft: 10,
  },
  arrowText: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  addButton: {
    backgroundColor: "#00B14F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  blankState: { alignItems: "center", marginTop: 50, padding: 20 },
  blankTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 8 },
  blankSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  navButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
});