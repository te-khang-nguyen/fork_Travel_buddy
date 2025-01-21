import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Card,
  Snackbar,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
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

  const [childRefs, setChildRefs] = useState<any>([]);

  const [challenge_id, setChallengeId] = useState<string | undefined>(
    undefined
  );
  const [isConfirmClicked, setIsConfirmClicked] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: history, error: historyError } = useGetProgressQuery(
    {
      challengeId: challenge_id,
    },
    {
      skip: !challenge_id,
    }
  );

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

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

  let challengeLocations = locationsData?.data || [];
  challengeLocations = [...challengeLocations].sort((a, b) => (Date.parse(a?.created)) - (Date.parse(b?.created)));

  useEffect(() => {
    setChildRefs(
      Array.from(
        { length: challengeLocations.length },
        (_, i) => childRefs[i] || React.createRef()
      )
    );
  }, [challengeLocations.length]);

  const handleParentConfirm = async () => {
    // Collect data from all children
    const collectedData = childRefs
      .map((ref, locationIndex) => {
        if (ref.current) {
          const childData = ref.current.getData();
          return {
            ...childData,
            index: locationIndex, // Add locationIndex from the map
            locationId: challengeLocations[locationIndex]?.id, // Add locationId from the location data
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null values

    // Upload data

    try {
      const isUploaded = collectedData?.map((ref) => {
        if (!ref?.userMediaSubmission || ref?.userMediaSubmission?.length == 0 || ref?.userQuestionSubmission == "") {
          return false;
        } else {
          return true;
        }
      })

      console.log(isUploaded);

      collectedData?.map(async (ref, index) => {
        if (isUploaded?.[index] === false) {
          setSnackbar({
            open: true,
            message:
              `Your story at ${challengeLocations[index]?.title} will be amazing with some ideas and at least one photo!`,
            severity: "warning",
          });
        } else {
          setIsConfirmClicked(true);
          const result = await uploadInputs({
            challengeId: challenge_id,
            userLocationSubmission: [ref],
          });

          if (result.error) {
            throw result.error;
          }

          setSnackbar({
            open: true,
            message:
              "Great sharings!\nThis chapter will be wonderful!\nLet's keep exploring while we craft your story!",
            severity: "success",
          });
    
          setTimeout(() => {
            setIsConfirmClicked(false);
            router.push(`/challenge/${challenge_id}/story`);
          }, 20000); // Adjust the timeout duration as needed

        }
      })

    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred while uploading data.",
        severity: "error",
      });
    }
    //finally {
    //   setIsConfirmClicked(false);
    // }
  };

  useEffect(() => {
    if (router.isReady) {
      const id =
        router.query.challenge_id ||
        router.query.challege_id ||
        router.query.id;

      setChallengeId(id as string | undefined);
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (challenge_id) {
      setIsLoading(isLocationsLoading || isLocationsFetching);
    }
  }, [challenge_id, isLocationsLoading, isLocationsFetching]);

  const [uploadInputs] = useUploadInputsMutation();

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

  if (isLoading) {
    return <LoadingSkeleton isLoading={isLoading} />;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#F5F5F5",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        minHeight: "100%",
        py: 2,
        px: { xs: 1, sm: 2, md: 4 },
        boxSizing: "border-box",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "90%", md: "600px" },
          minHeight: "90vh",
          height: "auto",
          mb: 4,
          boxShadow: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(197, 195, 218, 0.45)",
          p: { xs: 1, sm: 2, md: 2 },
          overflow: "visible",
        }}
      >
        {challengeLocations.map((location, index) => {
          const matchedLocationSubmission =
            history?.data?.[0]?.userChallengeSubmission?.filter(
              (e) => e.locationId == location?.id
            );
          const lastUserInputs = {
            lastUploadedTexts:
              matchedLocationSubmission?.[0]?.userQuestionSubmission,
            lastUploadedImgs:
              matchedLocationSubmission?.[0]?.userMediaSubmission?.map(
                (img, index) => {
                  return {
                    image: img,
                    name: `Image ${index} for ${location?.title}`,
                  };
                }
              ),
          };
          const accordionItems = [
            {
              header: "Write your own story",
              content:
                "Please add some notes about what you found, how you felt, and upload some photos! The more the merrier!",
              lastUploads: lastUserInputs,
            },
          ];
          return (
            <Box key={index} sx={{ mb: 4 }}>
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
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    fontWeight: "bold",
                    color: "darkblue",
                    textAlign: "center",
                    mb: { xs: 0.5, sm: 1, md: 1 },
                  }}
                >
                  {location.title}
                </Typography>
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
                {location.imageurls?.[0] && (
                  <Box
                    sx={{
                      position: "relative",
                      width: "50%",
                      height: "100%",
                      maxWidth: "400px",
                    }}
                  >
                    <Image
                      src={location.imageurls[0]}
                      alt={location.title}
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </Box>
                )}
              </Box>
              {location.location_info.map((section, index) => (
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
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Share your thoughts and uploads for this location:
                </Typography>
                <CustomAccordionList
                  ref={childRefs[index]}
                  withConfirmButton={false}
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
                  confirmStatus={isConfirmClicked}
                />
              </Box>
            </Box>
          );
        })}
        <Button
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            display: "block",
          }}
          onClick={() => {
            handleParentConfirm();
          }}
          disabled={isConfirmClicked}
        >
          {!isConfirmClicked ? (
            "Confirm"
          ) : (
            <CircularProgress size="20px" thickness={6.0} />
          )}
        </Button>
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
