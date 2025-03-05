import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PiCompassFill } from "react-icons/pi";

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EditorModal from "./TextEditorModal";

import { 
  Button, 
  Typography,
} from '@mui/material';
// ----------------------------------------------------------------------

export type RowProps = {
  id: string;
  type: string;
  name: string;
  url: string;
  text: string;
};

type TableRowProps = {
  row: RowProps;
  onSubmit?: (text: string) => void;
  withButton?: boolean;
  isButtonClicked?: boolean;
};

// const labelColors: { [key: string]: LabelColor } = {
//     published: 'success',
//     draft: 'info',
//     archived: 'default',
// }

export default function GenericTableRow({ 
    row, 
    onSubmit, 
    withButton,
    isButtonClicked
}: TableRowProps) {
  const [openPopover, setOpenPopover] = useState<boolean>(false);

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };


  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell align='center'>
          <PiCompassFill 
                          style={{
                            color: "rgb(38, 107, 209)",
                            transform: 'rotate(135deg)',
                            fontSize: '36px'
                          }}
            />
        </TableCell>

        <TableCell>
          <Box>
            <Typography sx={{ fontWeight: 'bold' }}>
            {row.name}
            </Typography>
            <Typography>
            {row.url}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align='right'>
          <Box display='flex' justifyContent='flex-end' gap='0.5rem'>
            <Button
              variant='outlined'
              color='inherit'
              onClick={handleOpenPopover}
            >
              Edit text
            </Button>
          </Box>
        </TableCell>
      </TableRow>

      {withButton && 
      <EditorModal
        open={openPopover}
        onClose={handleClosePopover}
        header={row.name}
        textValue={row.text}
        onConfirmation={(text) => onSubmit?.(text)}
        buttonText="Save"
        storageTextVarName={`text-for-${row.id}`}
        isLoading={isButtonClicked}
        styling={{
            multiline: true,
            rows: 10,
            enableCloseButton: true,
            buttonColor: "white"
        }}
      />}
    </>
  );
}
