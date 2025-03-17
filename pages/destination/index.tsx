import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DefaultExperience = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default destination_id
    router.push('/destination/select');
  }, [router]);

  return null; // You can return a loading spinner or message if desired
};

export default DefaultExperience;