import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Typography, Button, Paper } from '@mui/material';

interface ProfileFormInputs {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  facebook: string;
  instagram: string;
  x: string;
  phone: string;
}

const ProfileForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      username: 'Trac Ng',
      email: 'mtrac65@gmail.com',
      firstname: 'Trac',
      lastname: 'Ng',
      facebook: '',
      instagram: '',
      x: '',
      phone: '0384170128',
    },
  });

  const onSubmit = (data: ProfileFormInputs) => {
    console.log('Form Data:', data);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        backgroundColor: '#f4f4f4',
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          width: '100%',
          maxWidth: 800,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Profile Information
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {[
              { name: 'username', label: 'Username', required: true },
              { name: 'email', label: 'Email', required: true },
              { name: 'firstname', label: 'Firstname', required: true },
              { name: 'lastname', label: 'Lastname', required: true },
              { name: 'facebook', label: 'Facebook', required: false },
              { name: 'instagram', label: 'Instagram', required: false },
              { name: 'x', label: 'X', required: false },
              { name: 'phone', label: 'Phone', required: true },
            ].map((field) => (
              <Box
                key={field.name}
                sx={{
                  flex: '1 1 calc(50% - 16px)', // Two-column layout
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ marginBottom: 0.5, fontWeight: 500 }}
                >
                  {field.label}
                  {field.required && (
                    <Typography
                      component="span"
                      color="error"
                      sx={{ marginLeft: 0.5 }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>
                <Controller
                  name={field.name as keyof ProfileFormInputs}
                  control={control}
                  rules={
                    field.required
                      ? { required: `${field.label} is required` }
                      : undefined
                  }
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      fullWidth
                      variant="outlined"
                      error={!!errors[field.name as keyof ProfileFormInputs]}
                      helperText={
                        errors[field.name as keyof ProfileFormInputs]?.message
                      }
                    />
                  )}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ marginTop: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              
              sx={{ textTransform: 'none', width:'250px', padding: 1.5 }}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfileForm;
