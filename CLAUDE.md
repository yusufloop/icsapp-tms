# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- **Start development server**: `npm run dev` or `expo start`
- **Web development**: `expo start --web`
- **Android development**: `expo start --android` 
- **iOS development**: `expo start --ios`

### Code Quality
- **Lint code**: `npm run lint` (uses expo lint)
- **Reset project**: `npm run reset-project` (moves starter code to app-example)

### Testing
No specific test commands found in package.json. Use standard Expo testing approaches if tests are added.

## Architecture Overview

### Tech Stack
- **Framework**: Expo 52 with React Native and Expo Router for file-based routing
- **UI Styling**: Tailwind CSS with NativeWind for cross-platform styling
- **Database**: Supabase for backend, authentication, and real-time features
- **Authentication**: Supabase Auth with role-based access control
- **State Management**: React Context API for auth state
- **3D Graphics**: Three.js for 3D viewer functionality
- **Chat Integration**: N8N chat widget for AI assistance

### Project Structure
- **`app/`**: File-based routing structure with Expo Router
  - `(auth)/`: Authentication screens (sign-in, sign-up, forgot password)
  - `(app)/(tabs)/`: Main app with tab navigation
  - `(screens)/`: Additional screens (bookings, compliance, invoices, etc.)
- **`components/`**: Reusable UI components organized by feature
  - `auth/`: Authentication-related components
  - `dashboard/`: Dashboard components for different user roles
  - `ui/`: Premium design system components
- **`services/`**: Business logic and API integration layer
- **`lib/`**: Core utilities (Supabase client, auth provider)
- **`constants/`**: App constants including comprehensive design system

### Design System
The app uses an "Effortless Premium" design philosophy inspired by Apple's HIG:
- **Color System**: Primary blue (#0A84FF), semantic status colors, careful backgrounds
- **Typography**: System font stack with proper hierarchy
- **Spacing**: 4px grid system throughout
- **Components**: Premium variants with animations and glassmorphism effects
- **File**: `constants/DesignSystem.tsx` contains the complete design token system

### Authentication & Authorization
- **Supabase Auth**: PKCE flow with email/password authentication
- **Role-Based Access**: Dynamic role system defined in `constants/UserRoles.tsx`
- **Roles**: ADMIN, CLERK, DRIVER, CLIENT, GENERAL_MANAGER, HEAD_OF_DEPARTMENT, REQUESTER
- **Extended User Type**: User object includes roles and permissions
- **Auth Provider**: `lib/auth.tsx` handles auth state and role management

### Database Integration
- **Supabase Configuration**: Environment variables for URL and keys
- **Tables**: users, roles, user_roles for RBAC
- **Real-time**: Configured for live updates
- **Error Handling**: Centralized error handling utilities

### Cross-Platform Considerations
- **Platform-specific files**: `.web.tsx` variants for web-specific implementations
- **Storage**: AsyncStorage for mobile, localStorage for web
- **Headers**: Special handling for ngrok development setup

## Key Development Patterns

### Component Creation
1. Follow existing Premium UI component patterns in `components/ui/`
2. Use DesignSystem constants for consistent styling
3. Implement both mobile and web variants when needed
4. Follow the established naming convention (PremiumButton, PremiumCard, etc.)

### Route Creation
- Use Expo Router file-based routing in `app/` directory
- Authentication routes go in `(auth)/`
- Main app routes go in `(app)/(tabs)/` for tabbed navigation
- Additional screens go in `(screens)/`

### Service Integration
- Create services in `services/` directory following existing patterns
- Use Supabase client from `lib/supabase.tsx`
- Implement proper error handling with `handleSupabaseError`

### Role-Based Features
- Use `useAuth()` hook to access user roles
- Check permissions with `hasRole()` or `hasRoleId()` methods
- Reference `UserRoles.tsx` for role configuration and allowed actions

### Styling Approach
- Use Tailwind CSS classes with NativeWind
- Reference DesignSystem.tsx for design tokens
- Implement Premium component variants for elevated UI
- Use glassmorphism and gradients sparingly but effectively

## Environment Setup
- Requires Supabase environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`
- Optional ngrok configuration: `EXPO_PUBLIC_NGROK_SKIP_WARNING`
- Uses SecureStore for sensitive data on mobile, localStorage on web

## Special Features
- **3D Viewer**: Three.js integration for container visualization
- **AI Chat**: N8N chat widget integration
- **QR/Barcode Scanning**: Camera integration for logistics workflows
- **Maps Integration**: React Native Maps for route visualization
- **Document Handling**: Expo document picker for file uploads