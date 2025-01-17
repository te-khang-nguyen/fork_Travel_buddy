import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Card,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  useGetProgressQuery,
  useGetLocationsQuery,
  useUploadInputsMutation,
} from "@/libs/services/user/challenge";
import { useRouter } from "next/router";
import Image from "next/image";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import CustomAccordionList from "@/app/components/challenge/SectionWithCustomStyling";

const MainUI = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge_id, setChallengeId] = useState<string | undefined>(
    undefined
  );
  const [isConfirmClicked, setIsConfirmClicked] = useState(false);
  let lastUserInputs: any;
  const [uploadInputs] = useUploadInputsMutation();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Explicitly extract location_id from router query
  const { challege_id, location_id } = router.query;

  // Convert location_id to a number or keep as string based on your data structure
  const parsedLocationId =
    typeof location_id === "string"
      ? isNaN(Number(location_id))
        ? location_id
        : Number(location_id)
      : location_id;

  // Consistent hook for logging and ID extraction
  useEffect(() => {
    if (router.isReady) {
      // Try different variations of how the ID might be in the query
      const id =
        router.query.challenge_id ||
        router.query.challege_id ||
        router.query.id;

      setChallengeId(id as string | undefined);
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);

  const {
    data: locationsData,
    error: locationsError,
    isLoading: isLocationsLoading,
    isFetching: isLocationsFetching,
  } = useGetLocationsQuery(
    {
      challengeId: challenge_id,
    },
    {
      skip: !challenge_id,
    }
  );

  const { data: history, error: historyError } = useGetProgressQuery(
    {
      challengeId: challenge_id,
    },
    {
      skip: !challenge_id,
    }
  );

  // Update loading state based on locations query
  useEffect(() => {
    if (challenge_id) {
      setIsLoading(isLocationsLoading || isLocationsFetching);
    }
  }, [challenge_id, isLocationsLoading, isLocationsFetching]);

  // If there are errors, handle them
  if (locationsError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          Error Loading Locations:
          {locationsError &&
            ` Locations Error - ${JSON.stringify(locationsError)}`}
        </Typography>
      </Box>
    );
  }

  const handleInputsUpload = async (userInputs) => {
    setIsConfirmClicked(true);
    const result = await uploadInputs({
      challengeId: challenge_id,
      userLocationSubmission: [{ locationId: location_id, ...userInputs }]
    });

    if (result.error) {
      setIsConfirmClicked(false);
      setSnackbar({
        open: true,
        message: (result.error as any).data,
        severity: "error",
      });
    } else {
      setIsConfirmClicked(false);
      setSnackbar({
        open: true,
        message:
          "Great sharings!\nThis chapter will be wonderful!\nLet's keep exploring while we craft your story!",
        severity: "success",
      });
      setTimeout(() => {
        if (currentLocationIdx !== locationIds.length - 1) {
          window.location.href = `/challenge/${challege_id}/locations/${
            locationIds[currentLocationIdx + 1]
          }`; // Temporary - as currently it not scrolling to top
        } else {
          router.push(`/challenge/${challege_id}`);
        }
      }, 1000); // Adjust the timeout duration as needed
    }
  };

  // Find the specific location based on location_id
  const challengeLocations = locationsData?.data || [];

  const locationIds = challengeLocations.map((location) => location.id);

  // Use loose equality to handle different types
  const currentLocation = challengeLocations.find(
    (location) => location.id == parsedLocationId
  );

  const currentLocationIdx =
    locationIds &&
    locationIds.findIndex((location) => location == currentLocation.id);

  // If still loading, show loading state
  if (isLoading) {
    return <LoadingSkeleton isLoading={isLoading} />;
  }

  // If no challenge or locations, show appropriate message
  if (!currentLocation) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          Location not found
          <br />
          Location ID: {parsedLocationId}
          <br />
          Available Locations:{" "}
          {JSON.stringify(challengeLocations.map((loc) => loc.id))}
          <br />
          Location ID Type: {typeof parsedLocationId}
        </Typography>
      </Box>
    );
  } else {
    const matchedLocationSubmission = history?.data?.[0]?.userChallengeSubmission?.filter((e) => e.locationId == currentLocation?.id);
    lastUserInputs = {
      lastUploadedTexts: matchedLocationSubmission?.[0]?.userQuestionSubmission,
      lastUploadedImgs:
        matchedLocationSubmission?.[0]?.userMediaSubmission?.map(
          (img, index) => {
            return {
              image: img,
              name: `Image ${index} for ${currentLocation?.title}`,
            };
          }
        ),
    };
  }

  const accordionItems = [
    {
      header: "Write your own story",
      content:
        "Please add some notes about what you found, how you felt, and upload some photos! The more the merrier!",
      lastUploads: lastUserInputs,
    },
  ];

  const instructionSections = currentLocation.location_info || [
    {
      title: "Title",
      content: currentLocation.location_info.title || "No context available",
    },
    {
      title: "Instructions",
      content:
        currentLocation.location_info.instruction ||
        "No famous visitors available",
    },
    {
      title: "Photo Posting Guides",
      content: currentLocation.instruction || "No instruction available",
    },
  ];

  const handleGoBack = () => {
    router.push(`/challenge/${challenge_id}`);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#F5F5F5",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Changed from center to flex-start
        width: "100%",

        minHeight: "100%",
        py: 2, // Vertical padding
        px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
        boxSizing: "border-box", // Ensure padding is included in width calculation
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "90%", md: "600px" }, // Responsive max-width
          minHeight: "90vh", // Ensure minimum height
          height: "auto", // Allow content to determine height
          mb: 4,
          boxShadow: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(197, 195, 218, 0.45)",
          p: { xs: 1, sm: 2, md: 2 }, // Responsive padding
          overflow: "visible", // Allow content to be fully visible
          position: "relative", // Ensure proper positioning
        }}
      >
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "rgba(31, 177, 255, 0.23)",
            width: "100%",
            p: 2,
            textAlign: "center",
            borderRadius: 7,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              width: "100%",
            }}
          >
            <IconButton
              onClick={handleGoBack}
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Typography
              variant="h4"
              sx={{
                fontSize: {
                  xs: "1.5rem",
                  sm: "2rem",
                  md: "2.5rem",
                },
                fontWeight: "bold",
                color: "darkblue",
                textAlign: "center",
                fontStyle: "normal",
                mb: {
                  xs: 0.5,
                  sm: 1,
                  md: 1,
                },
              }}
            >
              {currentLocation.title}
            </Typography>
          </Box>
        </Card>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "300px",
            position: "relative",
          }}
        >
          {currentLocation.imageurls?.[0] && (
            <Box
              sx={{
                position: "relative",
                width: {xs:"80%", sm:"70%", md:"50%", lg:"50%"},
                height: "100%",
                maxWidth: "400px",
              }}
            >
              <Image
                src={currentLocation.imageurls[0]}
                alt={currentLocation.title}
                layout="fill"
                objectFit="contain"
                priority
              />
            </Box>
          )}
        </Box>
        {/* Add instruction section */}
        {instructionSections.map((section, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              width: "100%",
              gap: { xs: 1, sm: 2 },
              mb: 2,
              flexDirection: {
                xs: "row", // Change to row on mobile
                sm: "row",
              },
              alignItems: "flex-start", // Align items to the top
            }}
          >
            {/* Image on the left */}
            <Box
              sx={{
                width: {
                  xs: "120px",
                  sm: "200px",
                },
                height: {
                  xs: "120px",
                  sm: "200px",
                },
                position: "relative",
                flexShrink: 0,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {section.media?.[0] && (
                <Image
                  src={section.media[0]}
                  alt={section.title}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              )}
            </Box>

            {/* Text content on the right */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                flex: 1, // Take remaining space
                pl: { xs: 2, sm: 0 }, // Add left padding on mobile
              }}
            >
              {/* Title on top right */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  textAlign: { xs: "left", sm: "left" },
                  fontSize: {
                    xs: "1rem",
                    sm: "1.5rem",
                  },
                }}
              >
                {section.title}
              </Typography>

              {/* Instruction on bottom right */}
              <Typography
                variant="body2"
                sx={{
                  textAlign: { xs: "left", sm: "left" },
                  whiteSpace: "pre-line",
                  fontSize: {
                    xs: "0.75rem",
                    sm: "1rem",
                  },
                }}
              >
                {section.instruction}
              </Typography>
            </Box>
          </Box>
        ))}

        <CustomAccordionList
          items={accordionItems}
          sx={{
            mt: 2.5, // Add margin-top, slightly less than previous sections
            backgroundColor: "#F5F5F5", // Set the main box background color
            "& .MuiAccordion-root": {
              backgroundColor: "#F5F5F5",
            },
            "& .MuiAccordionDetails-root": {
              backgroundColor: "#F5F5F5", // Set AccordionDetails background color
            },
          }}
          onInputsUpload={handleInputsUpload}
          confirmStatus={isConfirmClicked}
        />
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={20000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainUI;
