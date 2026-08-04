import './globals.css';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'BugBot LMS - AI Grading & Doubt Portal',
  description: 'Submit code, get automated qualitative reviews, and participate in a shared moderated doubt board.',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Navbar />
          <main style={{ padding: '40px 0' }}>
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}