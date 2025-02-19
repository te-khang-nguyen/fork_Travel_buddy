import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusStyles = (status: string) => {
    const lowercaseStatus = status.toLowerCase();
    
    const statusStyles = {
      active: {
        borderColor: '#1976D2',
        backgroundColor: '#E6F2FF',
        color: '#1976D2'
      },
      archived: {
        borderColor: '#757575',
        backgroundColor: '#F0F0F0',
        color: '#757575'
      },
      pending: {
        borderColor: '#FFA500',
        backgroundColor: '#FFF3E0',
        color: '#FFA500'
      },
      default: {
        borderColor: '#000000',
        backgroundColor: '#FFFFFF',
        color: '#000000'
      }
    };

    return statusStyles[lowercaseStatus] || statusStyles.default;
  };

  const statusStyles = getStatusStyles(status);

  return (
    <Chip
      variant="outlined"
      label={status}
      sx={{
        border: '2px solid',
        borderColor: statusStyles.borderColor,
        backgroundColor: statusStyles.backgroundColor,
        color: statusStyles.color,
        fontWeight: 'bold',
        padding: '0 10px',
        borderRadius: '16px',
        ...props.sx
      }}
      {...props}
    />
  );
};

export default StatusChip;