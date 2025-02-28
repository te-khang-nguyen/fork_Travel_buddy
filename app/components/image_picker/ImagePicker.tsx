import React, { useEffect, useState, useMemo, ChangeEvent } from "react";
import { BsCamera2 } from "react-icons/bs";
import { GiPhotoCamera } from "react-icons/gi";
import { AiOutlineCamera } from "react-icons/ai";
import Dropzone, { useDropzone } from "react-dropzone";
import { Box, Button, Typography, CardMedia, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { File } from "openai/_shims/index.mjs";

export function blobToBase64(file: File | Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export function calculateSize(img: any, numberOfImgs: number){
  const width = img?.width;
  const height = img?.height;
  const buffer = Buffer.from(img.src.split(",")[1], "base64");
  const size = buffer.length / Math.pow(1024, 2); // in MB
  const scale = 0.7 / size;

  
  // console.log(`Old dimensions - W${width} x H${height}`);

  // console.log(`size - ${size}`);
  // console.log(`Threshold - ${threshold}`);
  // console.log(`Scale - ${scale}`);
  // console.log(`No Imgs - ${numberOfImgs}`);
  // console.log(`Original size - ${size.toFixed(3)} MB`);

  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  // console.log(`New dimensions - W${newWidth} x H${newHeight}`);

  return [newWidth, newHeight]
};

export function handleResize(
  file: File | Blob, 
  numberOfImgs: number,
  fileName?: string, 
): Promise<
  {image: string, name: string}
> {
  return new Promise(async (resolve, reject) => {
    const imageString = await blobToBase64(file);

    const img = new Image();
    img.src = imageString;

    img.onload = () => {
      const [newWidth, newHeight] = calculateSize(img, numberOfImgs);
      const canvas = document.createElement("canvas");

      canvas.width = newWidth;
      canvas.height = newHeight;

      // context is where the canvas references to know what data to render
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      // "compression" occurs below, where the new image is drawn onto the canvas based on the parameters we pass in
      // the second and third parameters tell the canvas where to place the image within its render, starting from the top left corner (i.e. a value greater than 0 will add whitespace from top-down, left-to-right
      // referencing https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // canvas.toBlob((blob) => {
      //   // Embedd original size into image tag
      //   const displayTag = document.createElement('h6');
      //   displayTag.innerText = `Original dimensions - W${img?.width} x H${img?.height}`;
      // })

      // here we specify the quality, which is the second argument in .toDataUrl(...) | here the output should be 50% the quality of the original, lowering the detail and file size
      const newImageUrl = ctx.canvas.toDataURL("image/jpg", 1); // quality ranges 0-1
      // below is not necessary (used for testing)
      const buffer = Buffer.from(newImageUrl.split(",")[1], "base64");
      const size = buffer.length / Math.pow(1024, 2); // in MB
      // console.log(`New size - ${size.toFixed(3)} MB`);
      // const uploadString = `W${img.width},H${img.height},${newImageUrl.split(",")[1]}`;
      resolve({
        image: newImageUrl, 
        name: typeof file === File? (file as File).name : fileName as string
      });
    }
    img.onerror = (e) => reject(e);

  })
}

interface UploadHandlerProps {
  acceptedFiles: File[] | FileList | null;
  selectedImages: Array<{ image: string | null; name: string | null }>;
  setImageError: (state: boolean) => void;
  setSelectedImages: (images: Array<{ image: string | null; name: string | null }>) => void;
  onImageUpload: (images: Array<{ image: string | null; name: string | null }>) => void;
  withResize?: boolean;
  allowMultiple?: boolean;
}


export const handleImageUpload = ({
  acceptedFiles,
  withResize,
  allowMultiple,
  selectedImages,
  setImageError,
  setSelectedImages,
  onImageUpload,
}: UploadHandlerProps) => {
  if (acceptedFiles && acceptedFiles.length > 0) {
    const files = typeof acceptedFiles ==='object'? 
                          Array.from(acceptedFiles)
                          : acceptedFiles;
    const numberOfFiles = files.length;
    const images = files.map((file) => {
      const reader = new FileReader();
      if(!withResize || (file.size / Math.pow(1024,2)) < 3.5){
        return new Promise<{ 
          image: string | null; 
          name: string | null 
        }>((resolve) => {
          reader.onload = () => {
            resolve({ image: reader.result as string, name: file.name });
          };
          reader.onerror = () => {
            setImageError(true);
            resolve({ image: null, name: file.name });
          };
          reader.readAsDataURL(file);
        });
      } else {
        // Resize image
        return new Promise<{ 
          image: string | null; 
          name: string | null;
        }>(async (resolve) => {
          const image = await handleResize(file, numberOfFiles);
          resolve(image);
        })
      }
    });

    Promise.all(images).then((uploadedImages) => {
      const updatedImages = allowMultiple ? [...selectedImages, ...uploadedImages] : uploadedImages;
      setSelectedImages(updatedImages);
      setImageError(false);
      onImageUpload(updatedImages); // Notify parent component
    });
  }
};


interface ImageUploaderProps {
  onImageUpload: (images: Array<{ image: string | null; name: string | null }>) => void;
  withDropzone?: boolean;
  variant?: "image" | "name"; // New prop for variants
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  fetchImages?: Array<{ image: string | null; name: string | null }>;
  withResize?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> =
  ({
    onImageUpload,
    variant = "image",
    withDropzone = false,
    allowMultiple = false,
    allowAddNew = true,
    fetchImages = [],
    withResize = false,
  }) => {
    const [selectedImages, setSelectedImages] = useState<
      Array<{ image: string | null; name: string | null }>
    >([]);

    // Memoize fetchImages to prevent unnecessary re-renders
    // const memorizedFetchImages = useMemo(() => 
    //   fetchImages.map(img => ({ 
    //     image: img.image, 
    //     name: img.name 
    //   })), 
    //   [JSON.stringify(fetchImages)]
    // );

    // useEffect(() => {
    //   // Only update if the memoized images are different from current selected images
    //   const areImagesEqual = JSON.stringify(memorizedFetchImages) !== JSON.stringify(selectedImages);
    //   if (areImagesEqual) {
    //     setSelectedImages(memorizedFetchImages);
    //   }
    // }, [memorizedFetchImages, selectedImages]);

    useEffect(() => {
      if (fetchImages.length > 0) {
        setSelectedImages(fetchImages);
      }
    },[fetchImages])

    const [imageError, setImageError] = useState(false);

    const handleRemoveImage = (index: number) => {
      const updatedImages = selectedImages.filter((_, i) => i !== index);
      setSelectedImages(updatedImages);
      onImageUpload(updatedImages); // Notify parent component
    };

    const paramObj = {
      withResize,
      allowMultiple,
      selectedImages,
      setImageError,
      setSelectedImages,
      onImageUpload,
    }

    const MediaUploadButton = (
            <Button
              variant="outlined"
              component="label"
              sx={{

                color: "primary",
                textTransform: "none",
                padding: "8px 16px",
                fontSize: { xs: "12px", sm: "14px" },
                borderRadius: "4px",
                // "&:hover": {
                //   backgroundColor: "#357ae8",
                // },
              }}
            >
              {allowMultiple ? "Browse Files" : "Browse File"}
              <input 
                type="file" 
                multiple={allowMultiple} 
                hidden 
                onChange={(e) => handleImageUpload({
                  acceptedFiles: e.target.files,
                  ...paramObj
                })} 
              />
            </Button>
    );


    const DropzoneUI = (
      <Dropzone onDrop={acceptedFiles => handleImageUpload({
        acceptedFiles,
        ...paramObj
      })}>
        {({getRootProps, getInputProps}) => (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: 1,
              borderStyle: "dashed",
              color: "grey",
              width: "100%",
              padding: 2,
            }}
          >
            <BsCamera2
              style={{
                fontSize: "40px",
                color: "grey"
              }}
            />
            <div {...getRootProps()}>
              <input {...getInputProps()} />
                <p>Drag and drop your photos here</p>
            </div>

            <Typography variant="body1"> OR </Typography>
            {MediaUploadButton}

          </Box>
        )}
      </Dropzone>
    );
    

    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
         {variant === "image" && (
          <Box
            sx={{
              display: "flex",
              flexWrap: allowMultiple ? "wrap" : "nowrap",
              gap: 2,
              mt: 1,
              mb: 1
            }}
          >
            {selectedImages.map((img, index) => (
              <Box
                key={index}
                sx={{
                  width: allowMultiple ? "100px" : "100%",
                  height: allowMultiple ? "100px" : "100%",
                  overflow: "hidden",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  src={
                    imageError || !img.image
                      ? "https://via.placeholder.com/100x100?text=No+Image"
                      : img.image
                  }
                  alt={img.name || "Uploaded"}
                  onError={() => setImageError(true)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {!allowAddNew ?
                  <Typography></Typography> :
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      padding: "4px",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>}
              </Box>
            ))}
          </Box>
        )}
        <Box display="flex" alignItems="center" gap={2}>
          {allowAddNew  &&
            (<>
            {!withDropzone?
              MediaUploadButton:DropzoneUI}
            </>)
          }

          <Typography
            sx={{ maxWidth: "300px" }}
            variant="body2"
            color="textSecondary"
          >
            {selectedImages.length > 0 && !withDropzone
              && "No files chosen"}
          </Typography>
        </Box>
       
      </Box>
    );
  };

export default ImageUploader;
