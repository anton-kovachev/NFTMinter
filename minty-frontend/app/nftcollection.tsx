"use client";
import { useState, useEffect, useRef } from "react";
import { BrowserProvider, Contract, ethers, JsonRpcSigner } from "ethers";
import { NftItemWithErrorBoundery } from "./nftitem";
import NftMinter from "./nftminter";
import {
  NFT_MINTER_CONTRACT_ABI,
  NFT_MINTER_CONTRACT_ADDRESS,
} from "../utils/contract";

export default function NftCollection() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const signerRef = useRef<JsonRpcSigner>(null);
  const nftMinterRef = useRef<Contract>(null);
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [signerBalance, setSignerBalance] = useState<number>(0);
  const [signerSymbol, setSignerSymbol] = useState<string>("");
  const [nftUris, setNfUris] = useState<string[]>([]);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      window.ethereum.on("accountsChanged", (accounts) => {
        if (!accounts.length) {
          nftMinterRef.current = null;
        }
      });
    }
  }, []);

  useEffect(() => {
    const getContract = async () => {
      if (provider) {
        signerRef.current = await provider.getSigner();
        const currentSignerAddress = await signerRef.current.getAddress();
        setSignerAddress(signerAddress);
        nftMinterRef.current = new ethers.Contract(
          NFT_MINTER_CONTRACT_ADDRESS,
          NFT_MINTER_CONTRACT_ABI,
          signerRef.current
        );

        setSignerBalance(
          await nftMinterRef.current.balanceOf(currentSignerAddress)
        );
        setSignerSymbol(await nftMinterRef.current.symbol());
      }
    };

    getContract();
  }, [provider]);

  useEffect(() => {
    const fetchNfts = async () => {
      if (nftMinterRef.current) {
        const nftUriSet = new Set<string>();
        for (let indx = 0; indx < signerBalance; indx++) {
          const nftId = await nftMinterRef.current.tokenByIndex(indx);
          const nftUri = (await nftMinterRef.current.tokenURI(nftId)) as string;
          nftUriSet.add(nftUri);
        }

        setNfUris([...nftUriSet]);
      }
    };

    fetchNfts();
  }, [nftMinterRef, signerBalance]);

  async function nftMinter(tokenUri) {
    if (nftMinterRef.current) {
      const currentSignerAddress = await signerRef.current?.getAddress();
      const mintTxn = await nftMinterRef.current.mintToken(currentSignerAddress, tokenUri);
      await mintTxn.wait();
      const currentBalance = await nftMinterRef.current.balanceOf(
        currentSignerAddress
      );
      setSignerBalance(Number(currentBalance));
    }
  }

  return signerRef.current ? (
    <>
      <h2>
        User {signerAddress} has balance of {signerBalance} {signerSymbol} nft
      </h2>
      <h3>Nft collection</h3>
      <div>
        {nftUris.map((x, index) => (
          <NftItemWithErrorBoundery key={index} nftUri={x} />
        ))}
      </div>
      <NftMinter mint={nftMinter} />
    </>
  ) : (
    <h1>Please connect to Metamask.</h1>
  );
}
