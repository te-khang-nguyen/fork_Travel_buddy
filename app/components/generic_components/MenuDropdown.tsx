import type { ButtonProps } from '@mui/material/Button';

import { useState, useCallback, useEffect } from 'react';

import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// ----------------------------------------------------------------------

type GenericMenuDropdownProps = ButtonProps & {
  selectedId: string;
  label: string;
  onSort: (newSort: string) => void;
  options: { id: string; name: string }[] | undefined;
};

export default function MenuDropdown({ 
  options, 
  label, 
  selectedId, 
  onSort, 
  sx, 
  ...other 
}: GenericMenuDropdownProps) {

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<string>('');

  useEffect(()=>{
    setSelected(selectedId || '');
  },[selectedId]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        onClick={handleOpenPopover}
        endIcon={<KeyboardArrowDownIcon/>}
        sx={sx}
        {...other}
      >
        <Typography 
            component="span" 
            variant="body1" 
            sx={{ 
                color: 'text.primary',
            }}
        >
          {options?.find((option) => option.id === selected)?.name}
        </Typography>
      </Button>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          width:"100%"
        }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: "100%",
            minWidth: 900,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          {options?.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === selected}
              onClick={() => {
                onSort(option.id);
                handleClosePopover();
              }}
            >
              {option.name}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
