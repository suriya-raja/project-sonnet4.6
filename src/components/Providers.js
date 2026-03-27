'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Use environment variable for the client ID, or a fallback dummy ID for development/UI preview
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id-for-preview-only.apps.googleusercontent.com';

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
