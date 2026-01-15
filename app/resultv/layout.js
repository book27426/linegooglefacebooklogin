import { AuthProvider } from '../testlogin/AuthContext'

export default function Layout({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}