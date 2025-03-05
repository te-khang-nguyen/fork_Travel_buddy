import React, { useState, useCallback, useEffect } from 'react';
import TableContainer from '@mui/material/TableContainer';
import GenericTableRow, {RowProps} from './TableRow';

import { 
  Box, 
  Button, 
  Card, 
  Typography, 
  Table, 
  TableBody,
  CircularProgress,
  Snackbar, 
  Alert, 
  AlertColor,
  SxProps,
  Theme
} from '@mui/material';

interface TableProps {
    tableData: RowProps[];
    isFetching?: boolean;
    withButton?: boolean;
    isButtonClicked?: boolean;
    onRowSubmit?: (row: {id: string; text: string}) => void;
    sx?: SxProps<Theme>;
}

const TableWithButton: React.FC<TableProps> = ({
    tableData,
    isFetching,
    withButton,
    isButtonClicked,
    onRowSubmit,
    sx,
}) => {

    const handleSubmit = (row: {id: string; text: string}) => {
        onRowSubmit?.(row)
    }

    return (
        <>
        <Card
          sx={sx ?? {width: "100%", borderRadius: 4, overflowY: "auto", maxHeight: "140vh"}}
        >
            <TableContainer sx={{ overflow: 'auto' }}>
              <Table sx={{ width: "100%" }}>
                <TableBody>
                  {isFetching?
                  (
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      gap='2rem' 
                      sx={{p: 2}}
                    >
                      <CircularProgress color='inherit'/>
                      <Typography>Fetching channels...</Typography>
                    </Box>
                  ):
                  tableData.length > 0 ? 
                  tableData?.map((row) => (
                    <GenericTableRow
                      key={row.id}
                      row={row}
                      onSubmit={(text) => handleSubmit({
                        id: row.id,
                        text: text
                      })}
                      withButton={withButton}
                      isButtonClicked={isButtonClicked}
                    />
                  )): 
                  <Box
                    sx={{
                      display:"flex",
                      alignSelf: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      p: 2
                    }}
                  >
                    <Typography
                        variant="h6"
                    >
                        No existing channel
                    </Typography>
                  </Box>
                  }

                </TableBody>
              </Table>
            </TableContainer>
        </Card>
        </>
    )
}

export default TableWithButton;