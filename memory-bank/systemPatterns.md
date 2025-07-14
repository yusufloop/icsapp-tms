# System Patterns: ICS Boltz TMS App

## 1. Architecture

The application follows a component-based architecture with clear separation of concerns between UI components, business logic, and services. Built on React Native with Expo, it enables cross-platform deployment to iOS and Android from a single codebase. The architecture emphasizes role-based access control and modular component design.

## 2. Key Technical Decisions

- **State Management:** The application utilizes React's built-in state management (useState, useContext) for local component state. Complex state like expanded cards uses Set data structures for optimal performance.
- **Navigation:** Navigation is handled by `expo-router` with file-based routing. The system implements role-based tab navigation that dynamically shows different tabs based on user roles.
- **Styling:** Styling is implemented using NativeWind (Tailwind CSS for React Native) following the "Effortless Premium" design philosophy. The system includes a comprehensive design system with premium components.
- **Backend Integration:** The application communicates with a Supabase backend for authentication, data storage, and other backend services.
- **Role-Based Access Control:** Centralized role management system with dynamic permission checking and UI rendering based on user roles.

## 3. Component Relationships

### Core Architecture
```
app/
├── (app)/
│   ├── (tabs)/          # Role-based tab navigation
│   │   ├── index.tsx    # Dashboard (all roles)
│   │   ├── requests.tsx # My Requests (all roles)
│   │   ├── scan.tsx     # QR Scanner (REQUESTER only)
│   │   ├── notifications.tsx # Notifications (HOD, GM only)
│   │   ├── user.tsx     # User Management (ADMIN only)
│   │   └── more.tsx     # More options (all roles)
│   └── _layout.tsx      # Role-based tab configuration
├── (auth)/              # Authentication screens
└── (screens)/           # Full-page screens outside tabs
    ├── new-booking.tsx  # 3-step booking flow (Step 1)
    ├── new-request.tsx
    ├── resubmit-request.tsx
    └── view-request.tsx
```

### Component Categories

- **Auth Components:** Located in `components/auth/`, these handle all authentication aspects including login, registration, password reset, and email verification.

- **UI Components:** The `components/ui/` directory contains the premium design system components:
  - `PremiumButton` - Animated buttons with multiple variants
  - `PremiumCard` - Elevated cards with shadow and glass variants
  - `PremiumInput` - Animated form inputs with focus states
  - `PremiumStatusBadge` - Status indicators with semantic colors
  - `RequestCard` - Complex expandable cards with role-based actions
  - `UserCard` - User management cards with expandable details

- **Dashboard Components:** Located in `components/dashboard/`, these provide role-specific dashboard functionality.

- **Screen Components:** Each screen follows the file-based routing structure with clear separation between tabbed and full-page screens.

## 4. Design Patterns

### Role-Based Access Control Pattern
- Centralized role definitions in `constants/UserRoles.tsx`
- Dynamic UI rendering based on user permissions
- Role-specific navigation tab configuration
- Action button filtering based on user role and request status

### Animation Patterns
- React Native Animated API for smooth dropdown animations
- Parallel animations for height, opacity, and rotation
- Staggered list item animations using react-native-reanimated
- Purposeful micro-interactions with opacity and scale feedback

### State Management Patterns
- Set data structures for multi-selection scenarios (expanded cards)
- Local state management with useState for component-specific data
- Props drilling for role-based configurations
- Conditional rendering patterns for role-specific UI elements

### Navigation Patterns
- File-based routing with expo-router
- Hidden tab routing for role-specific screens
- Absolute path navigation for cross-section navigation
- Parameter passing for form pre-population

## 5. Critical Implementation Paths

### Request Management Flow
1. User creates request via `/new-request` screen
2. Request appears in `requests.tsx` with role-based actions
3. Approval workflow through role-specific buttons
4. Status updates reflected in RequestCard component
5. Resubmission flow via `/resubmit-request` for unsuccessful requests

### Role-Based Navigation Flow
1. User role determined from `ICSBOLTZ_CURRENT_USER_ROLE`
2. Tab layout dynamically configured in `(tabs)/_layout.tsx`
3. Hidden tabs configured with `href: null` for unused routes
4. Role-specific features shown/hidden throughout the app

### New Booking Flow (3-Step Process)
1. User accesses booking flow via plus icon in requests page or "New Booking" in more page
2. **Step 1**: Basic information collection with progress indicator
   - Form validation ensures all required fields are completed
   - Client autocomplete provides dynamic suggestions with dropdown selection
   - Date/time pickers use native platform-specific components
   - Continue button navigates to Step 2
   - **Web Version**: `app/(screens)/new-booking.web.tsx` with constrained layout and proper scrolling
3. **Step 2**: Shipment details and cost estimation
   - Booking summary displays data from Step 1
   - 3D object placeholder for future Three.js integration
   - Shipment type and container size selection pickers
   - Dynamic items list with add/remove functionality
   - Weight and volume measurement inputs
   - Real-time estimated total calculation
   - Continue button navigates to Step 3
4. **Step 3**: Driver selection and booking finalization
   - Driver search and filtering functionality
   - Driver selection with radio button interface
   - Driver details modal with job information
   - Bookmark template functionality
   - Final booking creation and navigation back to requests

### Edit Booking System
1. User accesses edit functionality via edit buttons in RequestCard (mobile) or dropdown table (web)
2. **Mobile Version**: `app/(screens)/edit-booking.tsx`
   - SafeAreaView layout with proper header navigation
   - Modal pickers for dropdowns (standard mobile UX)
   - Sticky footer with Cancel and Update action buttons
   - Form pre-populated with booking data from URL parameters
3. **Web Version**: `app/(screens)/edit-booking.web.tsx`
   - Professional web layout with centered content and form cards
   - Dropdown behavior that pushes content below (matching web booking pages)
   - Constrained width layout (max-w-2xl) for optimal web viewing
   - Web-optimized dropdown positioning and interactions
4. **Comprehensive Form Features**:
   - All booking sections editable (Basic Info, Pickup, Delivery, Shipment Details)
   - Client autocomplete with dynamic suggestions
   - Native date/time pickers for all time fields
   - Dynamic items list management (add/edit/remove items)
   - Real-time cost calculation with updated estimates
   - Form validation with user-friendly error messages
5. **Integration Points**:
   - RequestCard edit button navigation with parameter passing
   - Web requests table edit button navigation with parameter passing
   - Booking data passed via URL parameters for form pre-population
   - Fixed infinite re-render bug with proper useEffect dependencies

### Component Interaction Flow
1. RequestCard handles complex state with animations
2. Role-based action buttons rendered dynamically
3. Navigation between screens maintains context
4. Form data passed via URL parameters for pre-population

### Form Input Patterns
- Standard TextInput components for reliable cross-platform compatibility
- Autocomplete functionality with dynamic suggestion filtering
- Native date/time pickers for optimal user experience
- Comprehensive form validation with user-friendly error messages
- Multi-line text areas for address fields with proper styling
