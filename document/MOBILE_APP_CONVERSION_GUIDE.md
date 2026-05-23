# 📱 skillup Mobile App Conversion Guide

## 🎯 Overview

This guide will help you convert your skillup web application into native mobile apps for **Android** and **iOS** using **React Native with Expo**.

---

## 🚀 Quick Start: Choose Your Approach

### Option 1: React Native with Expo (Recommended) ⭐

**Best for**: New mobile development, faster setup, easier deployment

- ✅ Same React knowledge
- ✅ One codebase for iOS & Android
- ✅ Easy app store publishing
- ✅ Over-the-air updates
- ✅ Native performance

### Option 2: React Native CLI

**Best for**: More control, custom native modules

- ✅ Full native access
- ❌ More complex setup
- ❌ Separate iOS/Android configs

### Option 3: Expo Router (Modern Expo)

**Best for**: File-based routing (similar to Next.js)

- ✅ Uses your existing route structure
- ✅ Best for new projects

---

## 📋 Prerequisites

### Required Tools

1. **Node.js** 18+ (you already have this)
2. **npm** or **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. **Expo Go App** (for testing):
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### For iOS Development (Mac only):

- **Xcode** (from App Store)
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account** ($99/year)

### For Android Development:

- **Android Studio**
- **Java JDK 11+**
- **Android SDK**
- **Google Play Developer Account** ($25 one-time)

---

## 🏗️ Project Structure Setup

### Step 1: Create New Mobile App Project

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Create new Expo project
npx create-expo-app skillup-mobile

# Navigate to project
cd skillup-mobile

# Or use TypeScript (recommended)
npx create-expo-app skillup-mobile --template
```

### Step 2: Choose Expo Template

**Recommended**: `blank (TypeScript)` for better type safety

```bash
npx create-expo-app skillup-mobile --template blank-typescript
```

---

## 📁 Recommended Project Structure

```
skillup-mobile/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/          # Common components
│   │   ├── profile/         # Profile components
│   │   ├── teachers/        # Teacher components
│   │   └── booking/         # Booking components
│   ├── screens/             # Screen components (like pages)
│   │   ├── auth/
│   │   │   ├── SignInScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   └── OTPLoginScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── profile/
│   │   │   └── ProfileScreen.tsx
│   │   ├── sessions/
│   │   │   ├── SessionsScreen.tsx
│   │   │   └── VideoSessionScreen.tsx
│   │   └── chat/
│   │       └── ChatScreen.tsx
│   ├── navigation/          # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── context/             # Context providers (reuse from web)
│   │   ├── UserContext.tsx
│   │   └── TokenContext.tsx
│   ├── services/            # API services (reuse from web)
│   │   └── api.ts
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utilities
│   └── types/               # TypeScript types
├── assets/                  # Images, fonts, etc.
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🔄 Migration Strategy

### Phase 1: Core Setup (Week 1)

#### 1.1 Install Required Packages

```bash
cd skillup-mobile

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# HTTP Client (reuse your API service)
npm install axios

# State Management (reuse contexts)
# Already built into React Native

# UI Components
npm install react-native-paper  # Material Design
# OR
npm install react-native-elements react-native-vector-icons  # Popular alternative

# Styling (can use Tailwind-like)
npm install nativewind  # Tailwind for React Native
npm install tailwindcss

# Video & Real-time
npm install react-native-agora  # Agora for mobile
npm install socket.io-client

# Forms & Validation
npm install react-hook-form
npm install yup

# Notifications
npm install expo-notifications

# Async Storage (like localStorage)
npm install @react-native-async-storage/async-storage

# Image Picker
npm install expo-image-picker

# Date/Time
npm install date-fns  # Same as web!

# Toast Notifications
npm install react-native-toast-message
```

#### 1.2 Setup Navigation

Create `src/navigation/AppNavigator.tsx`:

```typescript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import SignInScreen from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SessionsScreen from "../screens/sessions/SessionsScreen";
import ChatScreen from "../screens/chat/ChatScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (for authenticated users)
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const isAuthenticated = false; // Get from context

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### 1.3 Setup API Service (Reuse from Web)

Copy your existing `skillup/src/services/api.js` and adapt:

```typescript
// src/services/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - add token
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      await AsyncStorage.removeItem("token");
      // Navigate to login (use navigation ref)
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

### Phase 2: Migrate Core Screens (Week 2)

#### 2.1 Authentication Screens

**SignInScreen.tsx** (adapted from web):

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Store token
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Navigate to home
      navigation.navigate("Main");
    } catch (error) {
      console.error("Login error:", error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>

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

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  form: {
    width: "100%",
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
  link: {
    color: "#6366f1",
    textAlign: "center",
    marginTop: 20,
  },
});
```

#### 2.2 Home Screen

**HomeScreen.tsx**:

```typescript
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import TeacherCard from "../../components/teachers/TeacherCard";

export default function HomeScreen() {
  const { user } = useUser();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await api.get("/users/search?role=teacher");
      setTeachers(response.data.users);
    } catch (error) {
      console.error("Error loading teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Teachers</Text>
      <FlatList
        data={teachers}
        renderItem={({ item }) => <TeacherCard teacher={item} />}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTeachers} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
```

---

### Phase 3: Migrate Complex Features (Week 3-4)

#### 3.1 Video Call Integration

For Agora on mobile, use `react-native-agora`:

```typescript
// src/screens/sessions/VideoSessionScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  RtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";

const APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID;

export default function VideoSessionScreen({ route }) {
  const { sessionId } = route.params;
  const [engine, setEngine] = useState<RtcEngine | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    initAgora();
    return () => {
      engine?.destroy();
    };
  }, []);

  const initAgora = async () => {
    const agoraEngine = await RtcEngine.create(APP_ID);

    await agoraEngine.setChannelProfile(ChannelProfileType.Communication);
    await agoraEngine.enableVideo();
    await agoraEngine.enableAudio();

    setEngine(agoraEngine);
  };

  const joinChannel = async (
    token: string,
    channelName: string,
    uid: number
  ) => {
    if (!engine) return;

    await engine.joinChannel(token, channelName, uid, {
      clientRoleType: ClientRoleType.Broadcaster,
    });
    setJoined(true);
  };

  return (
    <View style={styles.container}>{/* Video views will be added here */}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
```

#### 3.2 Chat/Messaging

Use Socket.io (same as web):

```typescript
// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem("token");

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    };

    initSocket();
  }, []);

  return socket;
}
```

---

## 🎨 Styling Approaches

### Option 1: NativeWind (Tailwind for React Native) ⭐ Recommended

Install:

```bash
npm install nativewind tailwindcss
npx tailwindcss init
```

Usage:

```typescript
import { View, Text } from "react-native";

export default function Component() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-indigo-600">Hello World</Text>
    </View>
  );
}
```

### Option 2: StyleSheet (Built-in)

```typescript
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366f1",
  },
});
```

### Option 3: Styled Components

```bash
npm install styled-components
```

---

## 📦 Component Mapping Guide

### Web → Mobile Component Mapping

| Web Component   | Mobile Equivalent                       |
| --------------- | --------------------------------------- |
| `<div>`         | `<View>`                                |
| `<span>`, `<p>` | `<Text>`                                |
| `<button>`      | `<TouchableOpacity>` or `<Pressable>`   |
| `<input>`       | `<TextInput>`                           |
| `<img>`         | `<Image>`                               |
| `<a>`           | `<TouchableOpacity>` with navigation    |
| `<ul>`, `<li>`  | `<FlatList>` or `<ScrollView>`          |
| `onClick`       | `onPress`                               |
| `className`     | `style` or NativeWind `className`       |
| `useNavigate()` | `useNavigation()` from React Navigation |

---

## 🔧 Environment Variables

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url.com/api
EXPO_PUBLIC_SOCKET_URL=http://your-backend-url.com
EXPO_PUBLIC_AGORA_APP_ID=your_agora_app_id
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

Access in code:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## 🚀 Testing & Development

### Run on Simulator/Emulator

```bash
# Start Expo
npx expo start

# iOS Simulator (Mac only)
i

# Android Emulator
a

# Run on connected device
npx expo start --tunnel
```

### Run on Physical Device

1. Install **Expo Go** app on your phone
2. Scan QR code from terminal
3. App loads instantly!

---

## 📱 Building for Production

### Android APK/AAB

```bash
# Build APK
eas build --platform android

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Build for App Store
eas build --platform ios
```

### One Command for Both

```bash
eas build --platform all
```

---

## 📋 Feature Migration Checklist

### ✅ Phase 1: Core (Week 1)

- [ ] Project setup
- [ ] Navigation structure
- [ ] API service
- [ ] Context providers
- [ ] Authentication screens

### ✅ Phase 2: Main Features (Week 2-3)

- [ ] Home/Dashboard screen
- [ ] Profile screen
- [ ] Sessions list
- [ ] Teacher search
- [ ] Token management

### ✅ Phase 3: Advanced (Week 4-5)

- [ ] Video calls (Agora)
- [ ] Chat/Messaging
- [ ] Session booking
- [ ] Payments (Stripe)
- [ ] Notifications

### ✅ Phase 4: Polish (Week 6)

- [ ] Push notifications
- [ ] Image uploads
- [ ] Offline support
- [ ] Performance optimization
- [ ] App store assets

---

## 🎯 Quick Start Commands

```bash
# 1. Create project
npx create-expo-app skillup-mobile --template blank-typescript

# 2. Install dependencies
cd skillup-mobile
npm install @react-navigation/native @react-navigation/stack
npm install axios @react-native-async-storage/async-storage
npm install react-native-paper
npm install nativewind tailwindcss

# 3. Start development
npx expo start

# 4. Test on device
# Scan QR code with Expo Go app

# 5. Build for production
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

---

## 📚 Resources

### Documentation

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)

### Useful Tools

- [Expo Snack](https://snack.expo.dev/) - Test code in browser
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Debugging tool

---

## ⚠️ Important Notes

1. **API Backend**: Your backend should work as-is! Just update CORS settings:

   ```javascript
   // backend/src/server.js
   app.use(
     cors({
       origin: ["http://localhost:8081", "exp://localhost:8081"], // Expo default
     }),
   );
   ```

2. **Socket.io**: Works the same, just update connection URL

3. **Agora**: Use `react-native-agora` instead of web SDK

4. **File Uploads**: Use `expo-image-picker` and `expo-file-system`

5. **Push Notifications**: Use `expo-notifications`

---

## 🎉 Next Steps

1. **Start Small**: Migrate one screen at a time
2. **Test Often**: Use Expo Go for instant testing
3. **Reuse Logic**: Your API services and contexts can be reused!
4. **Iterate**: Build MVP first, then add features

---

**Ready to start? Run the Quick Start Commands above!** 🚀
