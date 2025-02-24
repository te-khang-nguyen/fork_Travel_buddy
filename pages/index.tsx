import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import UserLogin from "./login/user";
import BusinessLogin from "./login/business";

export default function Index(){
  const router = useRouter();
  const [loginType, setLoginType] = useState<string | null>(null);

  useEffect(() => {
    // Check if router is ready and query is available
    if (router.isReady) {
      const { type } = router.query;
      setLoginType(type as string || null);
    }
  }, [router.isReady, router.query]);

  if (loginType === 'business') {
    return <BusinessLogin />;
  }

  return <UserLogin />;
}