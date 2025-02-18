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
import { useUploadImageMutation } from "@/libs/services/storage/upload";
import { useRouter } from "next/router";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import LocationDetail from "@/app/components/challenge/LocationDetail";
import GenericModal from "@/app/components/kits/Modal";
import CustomInputsField from "@/app/components/challenge/UserInputsField";
import { getPayLoadSize } from "@/libs/services/utils";

const MainUI = () => {
  const router = useRouter();
  const challengeId = router.query.challege_id;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ uploadInputs ] = useUploadInputsMutation();
  const [ uploadImage ] = useUploadImageMutation();

  const [item, setItem] = useState<{
      lastUploadedTexts: string;
      lastUploadedImgs: Array<{
        image: string | null;
        name: string | null
      }>;
  }>({
      lastUploadedTexts: "",
      lastUploadedImgs: [],
  });

  const [modalTrigger, setModalTrigger] = useState<boolean>(false);

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

  const { 
    data: history, 
    error: historyError 
  } = useGetProgressQuery(
    {
      challengeId: challenge_id,
    },
    {
      skip: !challenge_id,
    }
  );

  useEffect(() => {
    const userLastSubmission = history?.data?.[0]?.userChallengeSubmission;
    if(userLastSubmission?.length === 1) {
      setItem({
        lastUploadedTexts: userLastSubmission?.[0]?.userQuestionSubmission || "",
        lastUploadedImgs: userLastSubmission?.[0]?.userMediaSubmission
          .map((img, index)=>({
              image: img, 
              name: `image-${index}`
          })) || [],
      })
    } else if (userLastSubmission?.length > 1){
      
      const concatenatedTexts = userLastSubmission?.map(
        (item) => item.userQuestionSubmission
      ).join("\n");
      const collectedImgs = userLastSubmission?.map(
        (item, index) => {
          return (item.userMediaSubmission || []).map(
            (imgUrl) => ({ 
              image: imgUrl, 
              name: `image-${index}`
            })
          )
        }
      ).flat();

      setItem({
        lastUploadedTexts: concatenatedTexts,
        lastUploadedImgs: collectedImgs,
      })

    }
  }, [history]);

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
  challengeLocations = [...challengeLocations].sort((a, b) => 
    (Date.parse(a?.created)) - (Date.parse(b?.created))
  );

  const handleModalOpen = () => {
    setModalTrigger(true);
  }

  const handleInputsUpload = async (userInputs) => {
    setIsConfirmClicked(true);
    // getPayLoadSize([userInputs]);

    const results = Promise.all(userInputs.userMediaSubmission.map(async (img, index) => {
      // getPayLoadSize([img]);
      const result = await uploadImage({
        imageBase64: img,
        title: `${challengeId}-ind${index}`,
        bucket: 'challenge',
      });

      if (result.error) {
        return false;
      }

      if (result.data) {
        return result.data?.signedUrl;
      }
    }));

    const storageUrls = await results;

    // getPayLoadSize(storageUrls);

    const submissionResult = await uploadInputs({
      challengeId: challenge_id,
      userLocationSubmission: [{
        userQuestionSubmission: userInputs.userQuestionSubmission,
        userMediaSubmission: storageUrls,
      }],
    });

    if (submissionResult.data) {
      setIsConfirmClicked(false);
        setSnackbar({
          open: true,
          message:
            `Great sharings!${<br/>}
            This chapter will be wonderful!${<br/>}
            Let's keep exploring while we craft your story!`,
          severity: "success",
        });
      router.push(`/challenge/${challenge_id}/story/`);
    } else {
      setIsConfirmClicked(false);
      setSnackbar({
        open: true,
        message: submissionResult.error as string,
        severity: "error",
      });
    }
  } 

  const modalChild = () => {
    return (
        <CustomInputsField
          withConfirmButton={true}
          index={1}
          onInputsUpload={handleInputsUpload}
          lastInputText={item?.lastUploadedTexts}
          lastUploadedImgs={item?.lastUploadedImgs}
          confirmStatus={isConfirmClicked}
          buttonText="Submit"
          sx={{
            // display: "flex",
            // flexDirection: "column",
            // justifyContent: "center",
            // alignItems: "flex-start",
            maxHeight: "90vh",
            width: "80%",
            // height: "80%",
            p: 2,
            backgroundColor: "rgba(246, 216, 174, 0.86)",
            borderRadius: 1,
            overflowY: "auto",
          }}
        />
    )
  }

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
          return (
            <LocationDetail
              key={index}
              index={index}
              location={location}
            />
          );
        })}
        <Button
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            display: "block",
          }}
          onClick={handleModalOpen}
        >
          Complete The Challenge
        </Button>
      </Card>

      <GenericModal
        open={modalTrigger}
        onClose={() => setModalTrigger(false)}
        sx={{
            width: "95%",
            height: "70%",
            mt: 3,
            left: "15%",
            borderRadius: 2,
          }}
      >
        {modalChild()}
      </GenericModal>

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
