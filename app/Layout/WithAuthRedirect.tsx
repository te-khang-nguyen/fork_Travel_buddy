import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import isAuthenticated from "@/libs/services/authorization";
import { JoinInnerTwoTone } from "@mui/icons-material";

const PUBLIC_ROUTES = ["/", "/register", "/login/business", "/recovery", "/auth/callbackv1","/docs"];

const withAuthRedirect = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthRedirect = (props: P) => {
    const router = useRouter();
    const contentId = router.query?.["content-id"];
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    if(contentId){
      localStorage.setItem("contentId", contentId as string);
    }

    useEffect(() => {
      const checkUserAuth = async () => {
        try {
          const jwt = localStorage.getItem("jwt") || "";
          const role = localStorage.getItem("role") || "";
          const isValidJwt = await isAuthenticated(jwt);  
          const storedContentId = localStorage.getItem("contentId");

          // Allow access to public routes 
          if (PUBLIC_ROUTES.includes(router.pathname)) {
            setIsCheckingAuth(false);
            return;
          }

          // Redirect to login if no JWT OR if JWT is invalid
          if (!isValidJwt) {
            localStorage.clear();
            sessionStorage.clear();
            if (router.pathname.includes("business")){
              await router.replace("/login/business");
              return;
            } else {
              await router.replace("/");
              return;
            }
          }

          if(router.pathname.includes("/challenge") && storedContentId) {
              localStorage.removeItem("challengeId");
          }
          
          if (router.pathname !== "/" && storedContentId) {
            router.push(`/challenge/${storedContentId}/locations`);
          }

          // If the role is 'user' and the path contains 'business', deny access
          if (role === 'user' && router.pathname.includes('business')) {
            await router.replace('/'); // Redirect to a no-access page
            return;
          }

          // Redirect to role-based dashboard if on root path with valid JWT and role
          if (router.pathname === "/" && isValidJwt && role) {
            await router.replace(`/dashboard/${role}`);
            return;
          }

          // Allow access to valid role-based or general routes
          const isRoleBasedPath = router.pathname.includes(role);
          const isGeneralPath = !router.pathname.includes("/business") && !router.pathname.includes("/user");

          if (isRoleBasedPath || isGeneralPath) {
            setIsCheckingAuth(false);
            return;
          }

          // Redirect to role-based dashboard if accessing invalid role-specific path
          await router.replace(`/dashboard/${role}`);
        } catch (error) {
          console.error("Error during authentication check:", error);
        } finally {
          setIsCheckingAuth(false);
        }
      };

      checkUserAuth();
    }, [router.pathname]);

    // Show a loading state while checking authentication
    if (isCheckingAuth) {
      return null; // Optionally, replace with a loader component
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthRedirect.displayName = `WithAuthRedirect(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithAuthRedirect;
};

export default withAuthRedirect;
