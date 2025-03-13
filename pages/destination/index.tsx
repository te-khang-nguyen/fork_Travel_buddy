import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DefaultExperience = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default destination_id
    router.push('/experience/e8e16f6e-bc5a-4135-a9e8-405ea282806d');
  }, [router]);

  return null; // You can return a loading spinner or message if desired
};

export default DefaultExperience;