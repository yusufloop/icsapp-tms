# Technical Context: ICS Boltz TMS App

## 1. Technologies Used

- **Framework:** React Native (Expo ~52.0.47)
- **Language:** TypeScript (~5.8.3)
- **Styling:** NativeWind (^4.1.23) - Tailwind CSS for React Native
- **Navigation:** Expo Router (~4.0.21) - File-based routing
- **Backend:** Supabase (^2.50.5)
- **Animations:** React Native Reanimated (~3.16.1) + React Native Animated API
- **Icons:** @expo/vector-icons, Lucide React (^0.525.0)
- **Fonts:** @expo-google-fonts/inter (^0.4.1)
- **Linting:** ESLint (^9.25.0)
- **Package Manager:** npm

## 2. Development Setup

To run the project locally, developers will need to have Node.js and npm installed. The application can be run on a simulator or a physical device using the Expo Go app.

**Setup Steps:**
1. Clone the repository from GitHub: `https://github.com/yusufloop/icsapp-tms.git`
2. Install dependencies with `npm install`
3. Set up environment variables in `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://aernjfsbaysmjobfhndr.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=[supabase_anon_key]
   ```
4. Run the development server with `npm start` or `npm run dev`
5. Use Expo Go app or simulator to view the application

**Available Scripts:**
- `npm start` / `npm run dev` - Start development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint
- `npm run reset-project` - Reset project structure

## 3. Technical Constraints

- **Cross-Platform Compatibility:** Must work seamlessly on both iOS and Android platforms
- **Responsive Design:** UI must adapt to different screen sizes and orientations
- **Performance:** Smooth animations and interactions, especially for complex components like RequestCard
- **Security:** All Supabase interactions must be secure with proper error handling
- **Role-Based Access:** UI must dynamically adapt based on user roles without security vulnerabilities
- **Offline Considerations:** App should handle network connectivity issues gracefully

## 4. Key Dependencies

### Core Dependencies
- **expo** (~52.0.47) - Core Expo framework
- **react** (18.3.1) - React library
- **react-native** (0.76.9) - React Native framework
- **typescript** (~5.8.3) - TypeScript support

### UI & Styling
- **nativewind** (^4.1.23) - Tailwind CSS for React Native
- **tailwindcss** (^3.4.17) - Tailwind CSS core
- **expo-linear-gradient** (~14.0.2) - Gradient components
- **expo-blur** (~14.0.3) - Blur effects

### Navigation & Routing
- **expo-router** (~4.0.21) - File-based routing system
- **react-native-screens** (~4.4.0) - Native screen management
- **react-native-safe-area-context** (4.12.0) - Safe area handling

### Backend & Data
- **@supabase/supabase-js** (^2.50.5) - Supabase client
- **expo-crypto** (~14.0.2) - Cryptographic functions

### Animations & Interactions
- **react-native-reanimated** (~3.16.1) - Advanced animations
- **react-native-gesture-handler** (~2.20.2) - Gesture handling
- **expo-haptics** (~14.0.1) - Haptic feedback

### Device Features
- **expo-document-picker** (~13.0.3) - File picker functionality
- **@react-native-community/datetimepicker** (8.2.0) - Date/time selection
- **react-native-webview** (13.12.5) - WebView component

### Icons & Fonts
- **@expo/vector-icons** (~14.0.4) - Icon library
- **lucide-react** (^0.525.0) - Additional icons
- **@expo-google-fonts/inter** (^0.4.1) - Inter font family

## 5. Tool Usage Patterns

### Version Control
- **Git:** Version control with GitHub repository
- **Repository:** `https://github.com/yusufloop/icsapp-tms.git`
- **Branching:** Standard Git workflow for feature development

### Code Quality
- **ESLint:** Enforces consistent coding style with expo configuration
- **TypeScript:** Provides static typing throughout the project
- **Prettier:** Code formatting (with Tailwind CSS plugin)

### Development Workflow
- **File-based Routing:** Expo Router enables intuitive navigation structure
- **Component-based Architecture:** Modular, reusable components
- **Role-based Development:** Features developed with role permissions in mind
- **Design System:** Consistent premium design components

### Environment Management
- **Environment Variables:** Supabase configuration via `.env` file
- **Development vs Production:** Separate configurations for different environments
- **Expo Configuration:** Managed through `app.json` and `expo` configuration

## 6. Architecture Decisions

### State Management Strategy
- **Local State:** React useState for component-specific state
- **Complex State:** Set data structures for performance (e.g., expanded cards)
- **Role Management:** Centralized role configuration system
- **No Global State Library:** Keeping it simple with React's built-in state management

### Animation Strategy
- **React Native Animated API:** For complex animations like RequestCard dropdowns
- **React Native Reanimated:** For list animations and screen transitions
- **Performance Focus:** Parallel animations and native driver usage where possible

### Component Design Philosophy
- **Premium Design System:** Following "Effortless Premium" philosophy
- **Reusable Components:** Modular UI components with consistent styling
- **Role-aware Components:** Components that adapt based on user permissions
- **Animation-first:** Smooth interactions and purposeful motion
