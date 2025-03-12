import React, { useState } from 'react';
import Button from '@mui/material/Button';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AttractionsIcon from '@mui/icons-material/Attractions';
import { useRouter } from 'next/router';
import Dialog from '@mui/material/Dialog';
import { DialogContent } from '@mui/material';
import ImageUploader from "@app/components/image_picker/ImagePicker";
import { useUploadImageMutation, useCreateMediaAssetMutation } from '@/libs/services/storage/upload';
import { useCreateDestinationDetailsMutation } from '@/libs/services/business/destination';
const typeMapping = {
  image: {
    text: "Add a photo",
    icon: <AddPhotoAlternateIcon />,
    routing: null,
  },
  attraction: {
    text: "Add an attraction",
    icon: <AttractionsIcon /> ,
    routing: '/attraction/create',
  },
};

function getTypeMapping(type: string) {
  return typeMapping[type] || { text: "Unknown type", icon: null };
}

const ButtonInEditSection = ({type}) => {
  
  // true indicates the "Like" state, false indicates "not like"
  const [clicked, setClicked] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [uploadImage] = useUploadImageMutation();
  const [createMediaAsset] = useCreateMediaAssetMutation();
  const [createDestinationDetails] = useCreateDestinationDetailsMutation();
  const router = useRouter();
  const { destination_id } = router.query;
  const handleClick = () => {
    setClicked(prev => !prev);
    if (type === 'image') {
      setOpenModal(true); // Open modal for image type
    } else if (typeMapping[type].routing) {
      const newUrl = {
        pathname: typeMapping[type].routing,
        query: { ...router.query }, // Spread existing query parameters
      };
      router.replace(newUrl);
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };


  const [uploadedImg, setUploadedImg] = useState<
    Array<{ image: string | null; name: string | null }>
  >([]);
  const handleImageUpload = (uploadedImages) => {
    setUploadedImg(uploadedImages);
  };

  const handleSaveImages = async () => {
    if (uploadedImg && destination_id) {
      for (const element of uploadedImg) {
        if (element["image"]) {
          const uploadImgResponse = await uploadImage({
              imageBase64: element["image"],
              title: 'DestinationDetails',
              bucket: 'destination',
          }).unwrap();
          element["imageSupabaseUrl"] = uploadImgResponse.signedUrl;
          const mediaAssetResponse = await createMediaAsset({
              signedUrl: uploadImgResponse.signedUrl,
              mimeType: 'image',
              usage: 'thumbnail',
          }).unwrap();
          await createDestinationDetails({
              destination_id : String(destination_id),
              type : "iconic_photos",
              name : "placeholder",
              text : "Please click to change name",
              media_id : mediaAssetResponse.data.id,
          })
        }
      };
    }
    handleModalClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        color="inherit"
        variant="contained"
        size="small"
        // Conditionally show the icon only when not in the "Like" state.
        startIcon={getTypeMapping(type).icon}
        sx={{
          textTransform: 'none',
          opacity: clicked ? 0.7 : 1.0,
          borderRadius: 2,
          boxShadow: "none",
          ml: 1
        }}
      >
        {getTypeMapping(type).text}
      </Button>
      {/* Modal for Image Input */}
      <Dialog open={openModal} onClose={handleModalClose}>
        <DialogContent>
          <ImageUploader
            allowMultiple={true}
            withDropzone={true}
            onImageUpload={handleImageUpload}
            withResize={true}
          />
          <Button
            onClick={handleSaveImages}
            variant="contained"
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: "none",
              ml: 1
            }}
          >
            Save
          </Button>
          <Button
            onClick={handleModalClose}
            color="inherit"
            variant="contained"
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: "none",
              ml: 1
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ButtonInEditSection;
