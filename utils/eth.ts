import Web3, { Address, Transaction } from "web3";
import { getAddresses } from "./storage";

const { PRIVATE_KEY, HOLESKY_RPC_URL } = process.env;

if (!PRIVATE_KEY || !HOLESKY_RPC_URL) {
  throw new Error("Missing environment variables");
}

const web3 = new Web3(new Web3.providers.HttpProvider(HOLESKY_RPC_URL));
const account = web3.eth.accounts.wallet.add(PRIVATE_KEY);
const nonceInQueue = new Set<bigint>();

const getNonce = async (): Promise<bigint> => {
  let nonce = await web3.eth.getTransactionCount(account[0].address);
  while (nonceInQueue.has(nonce)) {
    nonce++;
  }
  nonceInQueue.add(nonce);
  return nonce;
};

const ADDRESS_WETH_SEPOLIA = "0x54A2F8C92D65C7404A7a02df5CA60325fC6B27B2";
const ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "dst",
        type: "address",
      },
      {
        name: "wad",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const sendEther = async (recipientAddress: Address, amount: number) => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 200000;

    const tx: Transaction = {
      from: account[0].address,
      to: recipientAddress,
      value: web3.utils.toWei(amount.toString(), "ether"),
      nonce: await getNonce(),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
    };

    const txReceipt = await web3.eth.sendTransaction(tx);
    console.log("Tx hash:", txReceipt.transactionHash);
    return true;
  } catch (error) {
    console.error("An error occurred while sending ETH:", error);
    return false;
  }
};

async function transfer(recipientAddress: Address, amount: number) {
  try {
    const HYB_ERC20 = new web3.eth.Contract(ABI, ADDRESS_WETH_SEPOLIA);

    const txReceipt = await HYB_ERC20.methods
      .transfer(recipientAddress, web3.utils.toWei(amount.toString(), "ether"))
      .send({
        from: web3.eth.accounts.wallet[0].address,
        type: 0,
        nonce: (await getNonce()).toString(),
      });

    console.log("Tx hash:", txReceipt.transactionHash);
    return true;
  } catch (error) {
    console.error("An error occurred while sending ERC20:", error);
    return false;
  }
}

const contractABI = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "recipients",
        type: "address[]",
      },
    ],
    name: "multiSendETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // Include other functions if needed
];
const CONTRACT_ADDRESS = "0xaD7e1Fb9c1e94A53A6A37A4dAEe9eaf4C05d24D0";

async function sendMultiEth() {
  const addresses = await getAddresses();
  console.log(addresses);
  const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

  const txReceipt = await contract.methods.multiSendETH(addresses).send({
    from: account[0].address,
    value: web3.utils.toWei((0.1 * addresses.length).toString(), "ether"),
  });

  console.log("Tx hash:", txReceipt.transactionHash);
  return true;
}

export { sendEther, transfer, sendMultiEth };
