import { cookies } from 'next/headers';
import { getUserfromid } from '@/lib/db';
import ClientProfile from './client-profile';

export default async function Page() {
  const cookieStore = await cookies();   // ✅ REQUIRED
  const sessionCookie = cookieStore.get('session');
  const sessionToken = sessionCookie?.value;
  const user = await getUserfromid(sessionToken);
  if (!user) {
    return <div>User not found</div>;
  }
  return <ClientProfile user={user} />;
}
