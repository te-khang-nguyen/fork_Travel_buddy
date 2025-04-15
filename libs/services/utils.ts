// /* eslint-disable */

const base64toBinary = (input: string): Uint8Array => {
  if (!input || typeof input !== "string") {
      throw new Error("Invalid base64 input");
  }

  const base64Data = input.includes(",") ? input.split(",")[1] : input; // Handle missing prefix
  if (!base64Data) {
      throw new Error("Base64 data is empty or incorrectly formatted");
  }

  return Uint8Array.from(Buffer.from(base64Data, "base64"));
};

const getPayLoadSize = (payload) => {
  const payloadString = JSON.stringify(payload);
  const payloadSize = new Blob([payloadString]).size / Math.pow(1024, 2);
  console.log("Payload size: ", payloadSize.toFixed(4));
};


const apiRoutingCRUD = (req) => {
  const method = req.method;
  const url = req.nextUrl.clone();
  const pathSegments = url.pathname.split('/').filter(e => e !== 'v1' && e !== '');
  const newPath = pathSegments.join('/').replace("iconic-photos", "iconic_photos");
  const params = Array.from(url.searchParams.entries());
  const paramsString = params.map((item: any)=> `${item[0]}=${item[1]}`).join('&');

  switch(method){
    case 'GET':
      return params.length > 0 ? 
        `/${newPath}/get?${paramsString}` 
        : `/${newPath}/get-all`;
    case 'POST':
      return `/${newPath}/create?${paramsString}`;
    case 'PUT':
      return `/${newPath}/update?${paramsString}`;
    case 'DELETE':
      return `/${newPath}/delete?${paramsString}`;
    default:
      return;
  }
}

export {
  base64toBinary,
  getPayLoadSize,
  apiRoutingCRUD,
};
