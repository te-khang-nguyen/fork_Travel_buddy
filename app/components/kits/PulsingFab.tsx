// components/PulsingFab.tsx

import React from 'react';
import { Fab, FabProps } from '@mui/material';
import { styled } from '@mui/system';

// Define prop types
interface PulsingFabProps extends FabProps {
  isPulsing: boolean;
}

// Styled Fab with pulsing animation
const StyledFab = styled(Fab, {
  shouldForwardProp: (prop) => prop !== 'isPulsing',
})<{ isPulsing: boolean }>(({ isPulsing, theme }) => ({
  backgroundColor: isPulsing ? 'rgba(0, 102, 255, 0.75)' : theme.palette.primary.main,
  animation: isPulsing
    ? 'pulse-animation 1.5s infinite'
    : 'none',
  '@keyframes pulse-animation': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: '0 0 10px rgb(0, 26, 255)',
    },
    '50%': {
      transform: 'scale(1.2)',
      boxShadow: '0 0 20px rgba(33, 123, 248, 0.77)',
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: '0 0 10px rgb(121, 116, 254))',
    },
  },
  transition: 'background-color 0.3s ease', // Smooth transition for color change
}));

const PulsingFab: React.FC<PulsingFabProps> = ({ isPulsing, children, ...props }) => {
  return (
    <StyledFab isPulsing={isPulsing} {...props}>
      {children}
    </StyledFab>
  );
};

export default PulsingFab;
