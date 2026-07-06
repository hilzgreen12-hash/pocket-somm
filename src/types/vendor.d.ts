// @expo/vector-icons ships its own types but they don't resolve under this
// project's module settings (surfaces as "Cannot find module '@expo/vector-icons'"
// across the app). Declare it so icon imports type-check cleanly.
declare module '@expo/vector-icons';
