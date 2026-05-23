# 📱 skillup Mobile App - Quick Start Guide

## ⚡ Get Started in 30 Minutes!

This guide will help you create your first mobile app build.

---

## 🎯 Step-by-Step Instructions

### Step 1: Install Prerequisites (5 minutes)

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Verify installation
expo --version
```

### Step 2: Create Mobile App Project (5 minutes)

```bash
# Navigate to your project root
cd "C:\Users\Boyka\Zeyad Ragab\swaply final proj\swaply"

# Create new mobile app folder
npx create-expo-app skillup-mobile --template blank-typescript

# Navigate into mobile app
cd skillup-mobile
```

### Step 3: Install Essential Packages (10 minutes)

```bash
# Navigation (required)
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# Core dependencies
npm install axios @react-native-async-storage/async-storage

# UI Library (choose one)
npm install react-native-paper react-native-vector-icons

# OR use NativeWind (Tailwind for React Native)
npm install nativewind tailwindcss

# Forms & Validation
npm install react-hook-form yup

# Notifications
npm install expo-notifications

# Date handling (same as web)
npm install date-fns

# Toast messages
npm install react-native-toast-message
```

### Step 4: Copy Your API Service (5 minutes)

Copy your existing API service and adapt it:

```bash
# Copy the API service file
# From: skillup/src/services/api.js
# To: skillup-mobile/src/services/api.ts
```

Then update it:

```typescript
// skillup-mobile/src/services/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use your backend URL
const API_URL = "http://localhost:5000/api"; // Change to your backend URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
```

### Step 5: Create First Screen (5 minutes)

Create `src/screens/auth/SignInScreen.tsx`:

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Navigate to home (we'll set this up next)
      Alert.alert("Success", "Logged in successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#6366f1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

### Step 6: Setup Basic Navigation (5 minutes)

Create `App.tsx` in the root:

```typescript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from "./src/screens/auth/SignInScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Step 7: Test Your App! (5 minutes)

```bash
# Start Expo
npx expo start

# On your phone:
# 1. Install "Expo Go" app from App Store/Play Store
# 2. Scan the QR code shown in terminal
# 3. Your app will load!
```

---

## 🎯 What You've Built So Far

✅ Mobile app project setup
✅ Basic navigation
✅ Sign in screen
✅ API connection
✅ Token storage

---

## 📱 Next Steps

### 1. Add More Screens

- Sign Up screen
- Home screen
- Profile screen

### 2. Add Tab Navigation

- Bottom tabs for Home, Sessions, Chat, Profile

### 3. Migrate More Features

- Video calls
- Chat
- Session booking

---

## 🔧 Configuration Files

### app.json (Expo Config)

```json
{
  "expo": {
    "name": "skillup",
    "slug": "skillup",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6366f1"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.skillup.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6366f1"
      },
      "package": "com.skillup.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 🚨 Troubleshooting

### Issue: Can't connect to backend

**Solution**: Update backend CORS to allow Expo:

```javascript
app.use(
  cors({
    origin: ["http://localhost:8081", "exp://localhost:8081"],
  }),
);
```

### Issue: Navigation not working

**Solution**: Make sure you wrapped app with `<NavigationContainer>`

### Issue: Styling not applying

**Solution**: Check you're using React Native components (`View`, `Text`, not `div`, `span`)

---

## 📦 Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

---

## 🎉 You're Ready!

Your mobile app foundation is set up. Now you can:

1. Start migrating screens one by one
2. Test on your phone instantly with Expo Go
3. Build native apps when ready

**Next**: Follow the full migration guide in `MOBILE_APP_CONVERSION_GUIDE.md`

---

**Questions?** Check the full guide or Expo documentation!
