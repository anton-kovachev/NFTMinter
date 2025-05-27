import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function pinJSONToIPFS(jsonData: {
  name: string | null;
  description: string | null;
  file: any;
}) {
  if (!jsonData.name || !jsonData.description) {
    return { status: false, error: "Missing pinata api key or secret" };
  }

  try {
    const response = await pinata.upload.file(jsonData.file, {
      metadata: {
        name: jsonData.name,
        keyValues: { name: jsonData.name, description: jsonData.description },
      },
    });

    return { success: true, pinataUrl: response.IpfsHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function fetchFileByPinHash(ipsPinHash: string) {
    debugger;
  return (await pinata.listFiles().cid(ipsPinHash).pageLimit(1)).at(0);
}

export function getPinataFileUrl(ipsPinHash: string) {
  return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipsPinHash}`;
}
