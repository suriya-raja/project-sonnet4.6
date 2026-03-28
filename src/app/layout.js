import './globals.css';

export const metadata = {
  title: 'NOGIRR — Share Food, Share Love',
  description: 'Connect surplus food with people in need within 5km. Donate food, track deliveries, and climb the city leaderboard.',
  keywords: 'food sharing, food donation, NGO, surplus food, community',
  icons: {
    icon: '/favicon.png',
  },
};

import Providers from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
