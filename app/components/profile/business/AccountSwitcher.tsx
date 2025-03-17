import React, { useState, useEffect } from "react";
import {
    Box,
    Select,
    MenuItem,
    SelectChangeEvent,
  } from "@mui/material";

import { useGetAllProfilesQuery, BusinessProfile } from "@/libs/services/business/profile";
import { useRouter } from "next/router";
  
// New component for Account Switcher
const AccountSwitcher = () => {
  const [selectedAccount, setSelectedAccount] = useState(localStorage.getItem("account-name") || "Switch Account");
  const { data: allProfiles, isLoading, isError, error, refetch } = useGetAllProfilesQuery();
  const router = useRouter();
  useEffect(() => {
      refetch(); // Triggers API refetch when route changes
  }, [router.asPath]);
  // Ensure allAccounts is always an array
  const allAccounts: BusinessProfile[] = Array.isArray(allProfiles) 
    ? allProfiles
    : [];
  const handleAccountChange = (event: SelectChangeEvent<string>) => {
    setSelectedAccount(event.target.value);
  };

  const handleLocalStorageChangeAccount = (account_id : string, account_name : string) => {
    localStorage.setItem("account", account_id);
    localStorage.setItem("account-name", account_name);
    window.location.reload();
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (isError) {
    return (
      <Box sx={{ color: 'red', padding: 2 }}>
        Error loading accounts: {error?.toString()}
      </Box>
    );
  }

  if (!allAccounts || allAccounts.length === 0) {
    return (
      <Box sx={{ color: 'orange', padding: 2 }}>
        No accounts found
      </Box>
    );
  }

  return (
      <Box sx={{
        width: '20%',
        maxWidth: '300px',
        minWidth: '100px',
        padding: 1,
        marginLeft: 'auto',
        marginRight: 5,
      }}>
      <Select
        fullWidth
        value={selectedAccount}
        onChange={handleAccountChange}
        displayEmpty
        renderValue={(selected) => selected}
          sx={{
          height: 40, // Match search bar height
          '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px', // Reduce padding
              fontSize: '0.875rem', // Slightly smaller font
          }
          }}
      >
        <MenuItem disabled value="Switch Account">
          Switch Account
        </MenuItem>
        {allAccounts.map((account) => (
          <MenuItem 
            key={account.businessid} 
            value={account.businessname}
            onClick={() => {
              handleLocalStorageChangeAccount(
                account.businessid, 
                account.businessname
              );
            }}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                fontWeight: 'bold',
              },
              fontSize: '0.875rem', // Consistent font size
            }}
          >
            {account.businessname}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};


export default AccountSwitcher;