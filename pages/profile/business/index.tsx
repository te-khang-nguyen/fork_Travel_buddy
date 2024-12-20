import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useRouter } from "next/router";
import ChallengesTab from "@/app/components/profile/business/ChallengeTab";
import ProfileTab from "@/app/components/profile/business/ProfileTabtest";


const BusinessTabs = () => {
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();

  // Function to map hash to tab index
  const getTabFromHash = (hash: string): number => {
    switch (hash) {
      case "#challenges":
        return 1;
      case "#business-info":
        return 0;
      default:
        return 0; // Default to Profile Tab
    }
  };

  // Set tab based on hash from URL
  useEffect(() => {
    if (router.isReady) {
      const currentHash = window.location.hash; // Get current hash
      setTabValue(getTabFromHash(currentHash));
    }
  }, [router.isReady]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Update the URL hash when the user changes tabs
    const newHash = newValue === 0 ? "#business-info" : "#challenges";
    router.push(`${window.location.pathname}${newHash}`, undefined, { shallow: true });
  };

  return (
    <Box sx={{ width: "100%", p: 2, height: "100%", backgroundColor: "#f4f4f4" }}>
      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Business Info" />
        <Tab label="Challenges" />
      </Tabs>

      {/* Tab Content */}
      {tabValue === 0 && <ProfileTab />}
      {tabValue === 1 && <ChallengesTab />}
    </Box>
  );
};

export default BusinessTabs;
