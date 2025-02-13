// /* eslint-disable */
import { supabase } from "../supabase/supabase_client";
import { createSwaggerSpec } from "next-swagger-doc";
const crypto = require("crypto");

const base64toBinary = (input) => {
  return Uint8Array.from(Buffer.from(input.split(",")[1], "base64"));
};

const checkAndInsertUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "User not found after OAuth sign-in." };

  const { data: userProfile, error: profileError } = await supabase
    .from("userprofiles")
    .select("*")
    .eq("email", user.email)
    .single();

  if (profileError && profileError.code === "PGRST116") {
    const { error: insertError } = await supabase.from("userprofiles").insert({
      email: user.email,
      userid: user.id,
      username: user.user_metadata.full_name || user.email,
    });
    if (insertError) return { error: insertError.message };
  } else if (profileError) {
    return { error: profileError.message };
  }
  return { data: userProfile };
};

export const imgToDB = async (image, bucket) => {
  const bytesArray = typeof image === "string" ? base64toBinary(image) : image;
  const toStorageUpload = {
    bucket: "challenge",
    title: `${bucket}`,
    data: bytesArray,
  };

  const uploadResult = await uploadToStorage(toStorageUpload);
  if (uploadResult.error) {
    return { error: uploadResult.error };
  }

    return  uploadResult.data ;
};

const upsertNewRow = async (inputobj) => {
  const { entity, ...rest } = inputobj;
  let newRowRef;
  try {
    newRowRef = await supabase
      .from(inputobj.entity)
      .upsert({ ...rest })
      .select()
      .single();

    if (newRowRef.error) {
      return { error: newRowRef.error };
    }

    return { data: newRowRef.data };
  } catch (err: any) {
    return { error: err };
  }
};

const uploadNewRow = async (inputobj) => {
  const { entity, ...rest } = inputobj;
  let newRowRef;
  try {
    newRowRef = await supabase
      .from(inputobj.entity)
      .upsert(rest)
      .select()
      .single();

    if (newRowRef.error) {
      return { error: newRowRef.error };
    }

    return { data: newRowRef.data };
  } catch (err: any) {
    return { error: err };
  }
};

const updateRow = async (inputobj, queryId) => {
  const { entity, ...rest } = inputobj;
  try {
    const { data, error } = await supabase
      .from(inputobj.entity)
      .update(rest)
      .eq("id", queryId)
      .select();

    if (!error) {
      return { data };
    } else {
      return { error: error };
    }
  } catch (error) {
    return { error: error };
  }
};

const getRowById = async (inputobj) => {
  let targRow;
  try {
    targRow = await supabase
      .from(inputobj.entity)
      .select()
      .eq("id", inputobj.id)
      .single();
    if (targRow.error) {
      return { error: targRow.error };
    }

    return { data: targRow.data };
  } catch (error) {
    return { error };
  }
};

const getDataByField = async (inputobj, compound = false) => {
  let rowRef;

  //Attempt to retrieve the document infomation
  try {
    //Search for rows with searched field
    if (!compound && inputobj.searchField) {
      rowRef = await supabase
        .from(inputobj.entity)
        .select()
        .eq(inputobj.searchField, inputobj.value);
    } else if (compound && inputobj.searchField) {
      rowRef = await supabase
        .from(inputobj.entity)
        .select()
        .eq(inputobj.searchField[0], inputobj.value[0])
        .eq(inputobj.searchField[1], inputobj.value[1]);
    } else if (!inputobj.searchField) {
      rowRef = await supabase.from(inputobj.entity).select();
    }

    if (rowRef.error) {
      return { error: rowRef.error };
    }

    //Check if any document with the searched value existed in DB
    //If EXIST, return document data
    //If NOT, return NULL value
    if (rowRef.data.length > 0) {
      return { data: rowRef.data };
    } else {
      return { error: "Data not found!" };
    }
  } catch (error) {
    return { error };
  }
};

const uploadToStorage = async (inputobj) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hash = crypto.randomBytes(16).toString("hex");
  const fileName = `${inputobj.title.replace(/\s+/g, "")}_${hash}.jpg`;
  const storageRef = `${user!.id}/${inputobj.title}/${fileName}`;

  const uploadTask = await supabase.storage
    .from(inputobj.bucket)
    .upload(storageRef, inputobj.data, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/jpg",
    });

  if (uploadTask.error) {
    return { error: uploadTask.error };
  }
  const { data, error } = await supabase.storage
    .from(inputobj.bucket)
    .createSignedUrl(uploadTask.data.path, 60 * 60 * 24 * 365);

  if (error) {
    return { error };
  }

  return { data: data.signedUrl };
};

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "pages/api", // define api folder under app folder
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Travel Buddy API",
        version: "1.0.0",
        description: "API documentation for the Travel Buddy project",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });
  return spec;
};

export {
  checkAndInsertUserProfile,
  uploadNewRow,
  upsertNewRow,
  updateRow,
  getDataByField,
  getRowById,
  uploadToStorage,
  base64toBinary,
};
