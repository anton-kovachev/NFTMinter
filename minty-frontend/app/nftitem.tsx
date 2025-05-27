"use client";
import { memo, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { fetchFileByPinHash, getPinataFileUrl } from "../services/pinata";
import { withErrorBoundary } from "react-error-boundary";
import { NftData } from "../models/nft";

const NftItem = memo(function ({ nftUri = "" } : {nftUri: string}) {
  const [nftData, setNftData] = useState<NftData>({
    name: null,
    description: null,
    image: null,
  });

  const [fetchError, setFetchError] = useState<boolean>(false);

  useEffect(() => {
    const getNftData = async () => {
      if (nftUri?.length) {
        if (nftUri.endsWith("metadata.json")) {
          setNftData(await fetchNft());
        } else {
          setNftData(await fetchNftWithPinata());
        }
      }
    };

    getNftData();
  }, [nftUri]);

  if (!fetchError && nftData?.image?.length) {
    return (
      <div className="">
        <h3>{nftData.name}</h3>
        <Image
          src={nftData?.image ?? ""}
          alt={nftData.description ?? ""}
          width={500}
          height={500}
        />
      </div>
    );
  } else if (fetchError) {
    return <h3 className="errorHeader">Sorry something went wrong!</h3>;
  } else {
    return <h3>Data Loading</h3>;
  }

  async function fetchNftWithPinata(): Promise<NftData> {
    try {
      const ipfsHash = nftUri.split("ipfs://")[1];
      const pinataFileData = await fetchFileByPinHash(ipfsHash);
      return {
        image: getPinataFileUrl(ipfsHash),
        name: pinataFileData?.metadata?.name,
        description: pinataFileData?.metadata?.keyvalues?.description,
      };
    } catch (error) {
      setFetchError(true);
    }

    return { name: null, description: null, image: null };
  }

  async function fetchNft() {
    const nftDataUrl = `${process.env.NEXT_PUBLIC_IPFS_BASE_URL}/${nftUri
      .split(":")[1]
      .slice(2)}`;
    try {
      const response = await fetch(nftDataUrl);
      const jsonData = await response.json();
      return {
        ...jsonData,
        image: `${process.env.NEXT_PUBLIC_IPFS_BASE_URL}/${jsonData.image
          .split(":")[1]
          .slice(1)}`,
      };
    } catch (error) {
      setFetchError(true);
    }
    return { name: null, description: null, image: null };
  }
});

export const NftItemWithErrorBoundery = withErrorBoundary(NftItem, {
  fallback: <p>Failed to Load</p>,
});
