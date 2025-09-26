import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Markdown Playground",
  description: "Create and preview markdown in real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Try to get theme from IndexedDB synchronously if available
                  const request = indexedDB.open('MarkdownPlayground', 1);
                  request.onsuccess = function(event) {
                    const db = event.target.result;
                    if (db.objectStoreNames.contains('settings')) {
                      const transaction = db.transaction(['settings'], 'readonly');
                      const store = transaction.objectStore('settings');
                      const getRequest = store.get('theme');
                      getRequest.onsuccess = function() {
                        if (getRequest.result && getRequest.result.value === 'dark') {
                          document.documentElement.classList.add('dark');
                        }
                      };
                    }
                  };
                } catch (e) {
                  // IndexedDB not available or error, default to light theme
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
