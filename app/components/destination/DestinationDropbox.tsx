import React, { useEffect, useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import { useGetAllDestinationsQuery } from '@/libs/services/user/destination';

interface Destination {
  id: string;
  name: string;
}

import { Box, Typography } from '@mui/material';

interface DestinationDropboxProps {
  control: Control<any>;
  title: string;
  optional?: boolean;
  default_value?: string;
}

const DestinationDropbox: React.FC<DestinationDropboxProps> = ({ control, title, optional = false, default_value }) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);

    const {data: allDestinations} = useGetAllDestinationsQuery();
    useEffect(() => {
      if (allDestinations) {
          setDestinations(allDestinations.map((item) => ({
              id: item.id,
              name: item.name,
          })));
      }
  }, [allDestinations]);

  return (
    <Box mt={2} marginBottom={5}>
        <Typography
            variant="body2"
            sx={{ marginBottom: 2, fontWeight: 500 }}
        >
            {title}
        <Typography
            component="span"
            color="error"
            sx={{ marginLeft: 0.5 }}
        >
            {!optional ? "*" : ""}
        </Typography>
        </Typography>
      <Controller
        name="destination_id"
        control={control}
        defaultValue={default_value}
        rules={{ required: !optional }}
        render={({ field }) => (
          <select
            {...field}
            onChange={(e) => {
              field.onChange(e.target.value);
            }}
          >
            <option value="">Select a destination</option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
        )}
      />
    </Box>
  );
};

export default DestinationDropbox;