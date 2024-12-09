import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

import ChallengesTab from "@/app/components/profile/business/ChallengeTab";
import ProfileTab from "@/app/components/profile/business/ProfileTab";

const BusinessTabs = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", p: 2 ,height:'100%' ,backgroundColor:'#f4f4f4'}}>
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
