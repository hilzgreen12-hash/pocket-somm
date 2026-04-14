import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return <Redirect href={session ? '/(tabs)/scan' : '/(auth)/sign-in'} />;
}
