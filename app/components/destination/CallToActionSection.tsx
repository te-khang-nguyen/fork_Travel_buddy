import { Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import { Experience } from "@/libs/services/business/experience";

const CallToActionSection: React.FC<{destination: Experience}> = ({destination}) => {
    const router = useRouter();
    return(
      <><Typography variant="h5" align="center" sx={{ mt: 6, mb: 4 }}>
        {`Not in ${destination.name}? Maybe explore our other destinations?`}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        href="#"
        onClick={() => router.push('select')}
        sx={{ mx: 'auto', mb: 6, maxWidth: 200, alignItems: 'center', display: 'flex' }}
      >
        Explore
      </Button></>
    )
}
export default CallToActionSection;