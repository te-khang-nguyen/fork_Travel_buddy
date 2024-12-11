
import { Box, TextField, Button, Typography, Card, CardContent, FormControl } from "@mui/material";

const ProfileTab = () => {
  return (
    <Box sx={{ p: 2, display: "flex", width:'100%', justifyContent: "center" }}>
      <Card sx={{ width: "100%",  p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Business Information
          </Typography>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Business Name */}
            <FormControl fullWidth>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Business Name
              </Typography>
              <TextField variant="outlined" fullWidth defaultValue="TE" />
            </FormControl>

            {/* Email */}
            <FormControl fullWidth>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Email
              </Typography>
              <TextField variant="outlined" fullWidth defaultValue="trac.nguyen@talentedge.ai" />
            </FormControl>

            {/* Description */}
            <FormControl fullWidth>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Description
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                defaultValue="AI solution innovator"
              />
            </FormControl>

            {/* Location */}
            <FormControl fullWidth>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Location
              </Typography>
              <TextField variant="outlined" fullWidth defaultValue="Ho Chi Minh City" />
            </FormControl>

            {/* Contact Number */}
            <FormControl fullWidth>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Contact Number
              </Typography>
              <TextField variant="outlined" fullWidth defaultValue="0384170128" />
            </FormControl>

            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileTab