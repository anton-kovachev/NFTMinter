var provider = new ethers.providers.Web3Provider(window.ethereum);

const tokenAbi = [
  "constructor(string tokenName, string symbol)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function balanceOf(address owner) view returns (uint256)",
  "function baseURI() view returns (string)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function mintToken(address owner, string metadataURI) returns (uint256)",
  "function name() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId)",
];

const tokenAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
let tokenContract = null;
let signer = null;

async function getAccess() {
  if (tokenContract) return;

  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
}

async function getAllNfts() {
  await getAccess();

  const numNfts = await tokenContract.balanceOf(await signer.getAddress());
  document.getElementById("numNfts").innerHTML = numNfts;

  const nfts = [];
  const promises = [];

  for (let i = 0; i < numNfts; i++) {
    const promise = tokenContract.tokenByIndex(i).then((nftId) => {
      const id = nftId.toNumber();
      return tokenContract.tokenURI(id).then((uri) => nfts.push(uri));
    });

    promises.push(promise);
  }

  await Promise.all(promises);
  const nftImagePromises = loadNftImages(getUrl);
  await Promise.all(nftImagePromises);

  function loadNftImages(getUrl) {
    const nftContainer = document.getElementById("nfts");

    const linkPromises = [];
    for (const nft of nfts) {
      const link = getUrl(nft);
      const promise = fetch(link)
        .then((data) => {
          return data.json();
        })
        .then((json) => {
          const nftDiv = document.createElement("div");
          const image = document.createElement("img");
          image.src = getUrl(json.image);
          nftDiv.appendChild(image);

          const name = document.createElement("p");
          const nameText = document.createTextNode(json.name);
          name.appendChild(nameText);
          nftDiv.appendChild(name);

          const description = document.createElement("p");
          const descriptionText = document.createTextNode(json.description);
          description.appendChild(descriptionText);
          nftDiv.appendChild(description);

          nftContainer.appendChild(nftDiv);
        });

      linkPromises.push(promise);
    }
    return linkPromises;
  }

  function getUrl(ipfsUrl) {
    return "http://localhost:8080/ipfs" + ipfsUrl.split(":")[1].slice(1);
  }
}
