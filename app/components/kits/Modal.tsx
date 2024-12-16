import { Modal } from "@mui/material";
import React from "react";

type ReviewNotesComponentProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode; // Keep children as ReactNode to allow any valid JSX
};

const ReviewNotesComponent: React.FC<ReviewNotesComponentProps> = ({
  open,
  onClose,
  children, // Destructure children
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ alignSelf: "center", justifySelf: "center", width: "100%" }}
    >
      {/* Wrap children in a div or fragment to pass a single child */}
      <div>{children}</div>
    </Modal>
  );
};

export default ReviewNotesComponent;
