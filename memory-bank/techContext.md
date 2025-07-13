# Technical Context: ICS Boltz App

## 1. Technologies Used

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** Expo Router
- **Backend:** Supabase
- **Linting:** ESLint
- **Package Manager:** npm

## 2. Development Setup

To run the project locally, developers will need to have Node.js and npm installed. The application can be run on a simulator or a physical device using the Expo Go app. The following steps are required to get started:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up the environment variables by creating a `.env` file based on `.env.example`.
4. Run the development server with `npm start`.

## 3. Technical Constraints

- The application must be compatible with both iOS and Android platforms.
- The UI should be responsive and adapt to different screen sizes.
- All interactions with the Supabase backend must be secure and handle potential errors gracefully.

## 4. Dependencies

The project's dependencies are listed in the `package.json` file. Key dependencies include:

- `@react-native-async-storage/async-storage`
- `@supabase/supabase-js`
- `expo`
- `expo-router`
- `nativewind`
- `react`
- `react-native`

## 5. Tool Usage Patterns

- **Git:** The project uses Git for version control, with a remote repository hosted on GitHub.
- **ESLint:** ESLint is used to enforce a consistent coding style and identify potential issues in the code.
- **TypeScript:** TypeScript is used throughout the project to provide static typing and improve code quality.
