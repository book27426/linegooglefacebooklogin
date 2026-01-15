// import { AuthProvider } from './testlogin/AuthContext'
import CookieConsent from '@/components/CookieConsent';
import { AuthProvider } from './testloginv/AuthContext'
export default function DashboardLayout({ children }) {
  return (
    <html lang="en">
      <body>
        HEAD
        <main><AuthProvider>{children}</AuthProvider></main>
        <CookieConsent />
      </body>
    </html>
  )
}