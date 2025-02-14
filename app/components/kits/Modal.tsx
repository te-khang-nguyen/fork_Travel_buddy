import { Modal, SxProps, Theme, } from "@mui/material";
import React from "react";

type GenericModalProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode; // Keep children as ReactNode to allow any valid JSX
  sx?: SxProps<Theme>;
};

const GenericModal: React.FC<GenericModalProps> = ({
  open,
  onClose,
  children, // Destructure children
  sx,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={sx ?? { alignSelf: "center", justifySelf: "center", width: "100%" }}
    >
      {/* Wrap children in a div or fragment to pass a single child */}
      <div>{children}</div>
    </Modal>
  );
};

export default GenericModal;
