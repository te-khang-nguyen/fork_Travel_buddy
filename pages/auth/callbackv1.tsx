import { useEffect } from "react";
import { useRouter } from "next/router";
import { checkAndInsertUserProfile } from "@/libs/services/utils";

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      await checkAndInsertUserProfile();
      router.push("/dashboard/user");
    };

    handleCallback();
  }, []);

  return <div>Loading...</div>;
};

export default Callback;
