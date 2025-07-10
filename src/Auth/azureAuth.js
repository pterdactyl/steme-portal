export const msalConfig = {
    auth: {
      clientId: "3bac71dd-2ef6-4145-9048-064322bd6774", // from Entra ID
      authority: "https://login.microsoftonline.com/common", // or your tenant ID
      redirectUri: "http://localhost:3000", // same as in Azure portal
    },
  };
  
  export const loginRequest = {
    scopes: ["User.Read"],
  };