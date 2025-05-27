"use client";
import { useEffect, useState } from "react";
import { pinJSONToIPFS } from "../services/pinata";

export default function NftMinter({ mint }) {
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [status, setStatus] = useState<boolean>(true);
  const [canMint, setCanMint] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (name && description && file) {
      setCanMint(true);
    } else {
      setCanMint(false);
    }
  }, [name, description, file]);

  const mintNftFunc = async () => {
    const response = await pinJSONToIPFS({ name, description, file });
    if (!response.success) {
      return {
        success: false,
        status: "Sorry something went wrong",
      };
    } else {
      const tokenUri = response.pinataUrl;
      const mintResult = await mint(tokenUri);
      if (mintResult) {
        setStatus(true);
      }
    }
  };

  return (
    <div className="Minter">
      <h1>Nft Minter</h1>
      <p>
        Simply add your asset's link, name, and description, then press "Mint."
      </p>
      <br />
      <form>
        <h3>Asset Name:</h3>
        <input
          size={50}
          type="text"
          placeholder="e.g. my first nft"
          onChange={(event) => setName(event.target.value)}
        />
        <br />
        <h3>Asset Description:</h3>
        <input
          size={50}
          type="text"
          placeholder="e.g. super cool"
          onChange={(event) => setDescription(event.target.value)}
        />
        <br />

        <div>
          <br />
          <input
            id="file"
            type="file"
            //@ts-ignore
            onChange={(event) => setFile(event?.target?.files[0])}
          />
        </div>
        <br />
        <div>
          <input
            disabled={!canMint}
            type="button"
            value="Mint"
            onClick={(event) => mintNftFunc()}
          />
        </div>
      </form>
    </div>
  );
}
