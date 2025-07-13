# System Patterns: ICS Boltz App

## 1. Architecture

The application follows a component-based architecture, with a clear separation of concerns between UI components, business logic, and services. It is built on React Native, allowing for cross-platform deployment to iOS and Android from a single codebase.

## 2. Key Technical Decisions

- **State Management:** The application will utilize React's built-in state management (useState, useContext) for local component state and may incorporate a more robust solution for global state if the complexity of the application grows.
- **Navigation:** Navigation is handled by `expo-router`, which provides a file-based routing system that is both powerful and easy to understand.
- **Styling:** Styling is implemented using NativeWind, which brings the utility-first approach of Tailwind CSS to React Native. This allows for rapid UI development and a consistent design language.
- **Backend Integration:** The application communicates with a Supabase backend for authentication, data storage, and other backend services.

## 3. Component Relationships

- **Auth Components:** The components within `components/auth/` are responsible for handling all aspects of user authentication. They are designed to be modular and reusable.
- **UI Components:** The `components/ui/` directory contains a set of reusable UI components that form the building blocks of the application's user interface. These components are designed to be consistent with the project's design system.
- **Screen Components:** Each screen in the application is represented by a component in the `app/` directory, which is organized according to the navigation structure.
