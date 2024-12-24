// /* eslint-disable */
// import { supabase } from '../supabase/supabase_client';


// const uploadNewRow = async (inputobj) => {
//     const {data: {user}} = await supabase.auth.getUser();
//     console.log("Current user:",user);

//     const {entity, ...rest} = inputobj;
//     let newRowRef;
// 	try{
//         console.log("Add new row");
//         newRowRef = await supabase
//                 .from(inputobj.entity)
//                 .upsert(rest)
//                 .select()
//                 .single();

//         if (newRowRef.error) {
//             console.log("Fail to insert new row to table! Error:", newRowRef.error);
//             return {data: null, error: newRowRef.error};
//         } 

//         console.log("Successfully created new profile in DB");
//         return {data: newRowRef.data, error: null};
        
// 	} catch (error) {
// 		console.log("Fail to create profile in DB!", error);
//         return {data: null, error: error};
// 	};
	
// };

// const updateRow = async (inputobj, queryId) => {
//     const {data: {user}} = await supabase.auth.getUser();
//     console.log("Current user:",user);

//     const {entity, ...rest} = inputobj;
//     try {
//         const { error } = await supabase
//                     .from(inputobj.entity)
//                     .update(rest)
//                     .eq('id', queryId);

//         if (!error) {
//             console.log("Update is successful!");
//             return { error: error };
//         } else {
//             console.log("No document found!");
//             return {data: "Update unsuccessful!"};
//         }
//     } catch (error) {
//         console.log("Update is unsuccessful!", error);
//         return { error: error };
//     }
// };


// const getRowById = async (inputobj) => {
// 	let targRow;
// 	try{
//         targRow = await supabase
//             .from(inputobj.entity)
//             .select()
//             .eq('id',inputobj.id)
//             .single();
//         if (targRow.error){
//             console.log("Retrieving error:", targRow.data);
//             return {error: targRow.error};
//         }

//         console.log("Retrieved row:", targRow.data)
//         return {data: targRow.data};
		
// 	} catch (error) {
// 		console.log("Failed to get document", error);
//         return { error };
// 	}
// };


// const getDatabyField = async (inputobj, compound = false) => {
//     const {data: {user}} = await supabase.auth.getUser();
//     console.log("Current user:",user);
    
//     let rowRef;
    
//     //Attempt to retrieve the document infomation
//     try{
//         //Search for rows with searched field
//         if (!compound && inputobj.searchField) {
//             rowRef = await supabase
//                 .from(inputobj.entity)
//                 .select()
//                 .eq(inputobj.searchField,inputobj.value);
              
//         } else if (compound && inputobj.searchField) {
//             rowRef = await supabase
//                 .from(inputobj.entity)
//                 .select()
//                 .eq(inputobj.searchField[0],inputobj.value[0])
//                 .eq(inputobj.searchField[1],inputobj.value[1]);
//         } else if (!inputobj.searchField) {
//             rowRef = await supabase
//                 .from(inputobj.entity)
//                 .select();
//         }

//         if (rowRef.error){
//                 console.log(rowRef.error);
//                 return {error: rowRef.error};
//         }

//         console.log("Search status:", rowRef);

//         //Check if any document with the searched value existed in DB
//         //If EXIST, return document data
//         //If NOT, return NULL value 
//         if (rowRef.data.length > 0) {
//             //let data = docRef.docs[0].data(); // 
//             console.log("Document data", rowRef.data);
// 	        return {data: rowRef.data};
//         } else {
// 	        console.log(`No record found with ${inputobj.searchField} equal to ${inputobj.value}!`);
// 	        return {error: 'Data not found!'};
//         }
//     } catch (error) {
//         console.log("Error retrieiving record",error);
//         return { error };
//     }
	
// };



// const getFBStorageURL = async (inputobj) => {
//     const fileName = `${inputobj.provider}_${inputobj.location}.jpg`;
//     const storageRef = ref(fbStorage, `${inputobj.service}/images/${fileName}`);
//     try {
//         let itemURL = await getDownloadURL(storageRef);
//         console.log("Retrieved item successful!");
//         return itemURL;
//     } catch (error) {
//         console.log("Retrieved item unsuccessful!", error);
//         return error;
//     }
    
// };



// const uploadToStorage = async (inputobj) => {
//     const {data: {user}} = await supabase.auth.getUser();
//     console.log("Current user:",user);

//     let fileName = `${inputobj.title.replace(/\s+/g, "")}_${inputobj.location.replace(/\s+/g, "")}.jpg`;
//     const storageRef = `${user.id}/${inputobj.title}/${fileName}`;

//     console.log(storageRef);
     
//     let uploadTask = await supabase
//         .storage
//         .from(inputobj.bucket)
//         .upload(storageRef, inputobj.data, {
//             cacheControl: '3600',
//             upsert: true,
//             contentType: 'image/jpg'
//         });
    
//     if (uploadTask.error) {
//         console.log(uploadTask);
//         return {error: uploadTask.error};
//     } 
//     const { data, error } = await supabase
//             .storage
//             .from(inputobj.bucket)
//             .createSignedUrl(uploadTask.data.path, 60*60*24*365);

//     if (error) {
//         console.log(`URL retrieval error: ${error}`);
//         return {error};
//     } 

//     console.log(`URL for the uploaded file: ${data.signedUrl}`);
//     return { data:data.signedUrl };
// }




// const uploadToStorageResummable = async (inputobj) => {
//     let fileName = `${inputobj.title.replace(/\s+/g, "")}_${inputobj.location.replace(/\s+/g, "")}.jpg`;
//     const storageRef = `${user.id}/${inputobj.title}/${fileName}`;
     
//     const tus = require('tus-js-client');

//     const projectId = 'wrhbhrlmmrnjwwxhcxnn';
//         const { data: { session } } = await supabase.auth.getSession()

//         return new Promise((resolve, reject) => {
//             var upload = new tus.Upload(file, {
//                 endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
//                 retryDelays: [0, 3000, 5000, 10000, 20000],
//                 headers: {
//                     authorization: `Bearer ${session.access_token}`,
//                     'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
//                 },
//                 uploadDataDuringCreation: true,
//                 removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
//                 metadata: {
//                     bucketName: inputobj.bucket,
//                     objectName: storageRef,
//                     contentType: 'image/jpg',
//                     cacheControl: 3600,
//                 },
//                 chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
//                 onError: function (error) {
//                     console.log('Failed because: ' + error);
//                     reject(error);
//                 },
//                 onProgress: function (bytesUploaded, bytesTotal) {
//                     var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
//                     console.log(bytesUploaded, bytesTotal, percentage + '%');
//                 },
//                 onSuccess: function () {
//                     console.log('Download %s from %s', upload.file.name, upload.url);
//                     resolve(upload.url);
//                 },
//             })


//             // Check if there are any previous uploads to continue.
//             return upload.findPreviousUploads().then(function (previousUploads) {
//                 // Found previous uploads so we select the first one.
//                 if (previousUploads.length) {
//                     upload.resumeFromPreviousUpload(previousUploads[0]);
//                 }

//                 // Start the upload
//                 upload.start()
//             })
//         })
// }

// module.exports = {
// 	uploadNewRow,
//     updateRow,
//     getFBStorageURL,
//     getDatabyField,
//     getRowById,
//     uploadToStorage,
//     uploadToStorageResummable,
// };