import { AuthProvider } from '../testloginv/AuthContext'

export default function Layout({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}