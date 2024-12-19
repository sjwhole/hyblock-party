import { Address } from "web3";
import fs from "fs/promises";

const CLAIMED_ADDRESSES_FILE = "claimedAddresses.json";

const isAddressAdded = async (address: Address): Promise<boolean> => {
  try {
    const data = await fs.readFile(CLAIMED_ADDRESSES_FILE, "utf-8");
    const json = JSON.parse(data);
    return json.addresses.includes(address.toLowerCase());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// Function to add an address to the claimed list
const addAddress = async (address: Address): Promise<void> => {
  let json;
  try {
    const data = await fs.readFile(CLAIMED_ADDRESSES_FILE, "utf-8");
    json = JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      json = { addresses: [] };
    } else {
      throw error;
    }
  }

  // Ensure addresses are stored in lowercase for consistency
  if (!json.addresses.includes(address.toLowerCase())) {
    json.addresses.push(address.toLowerCase());
    await fs.writeFile(CLAIMED_ADDRESSES_FILE, JSON.stringify(json, null, 2));
  }
};

const getAddresses = async (): Promise<Address[]> => {
  try {
    const data = await fs.readFile(CLAIMED_ADDRESSES_FILE, "utf-8");
    const json = JSON.parse(data);
    return json.addresses;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

// const removeClaimedAddress = async (address: Address): Promise<void> => {
//   let json;
//   try {
//     const data = await fs.readFile(CLAIMED_ADDRESSES_FILE, "utf-8");
//     json = JSON.parse(data);
//   } catch (error) {
//     if ((error as NodeJS.ErrnoException).code === "ENOENT") {
//       // File doesn't exist, no one has claimed yet
//       return;
//     }
//     throw error;
//   }

//   const index = json.addresses.indexOf(address.toLowerCase());
//   if (index !== -1) {
//     json.addresses.splice(index, 1);
//     await fs.writeFile(CLAIMED_ADDRESSES_FILE, JSON.stringify(json, null, 2));
//   }
// };

export { isAddressAdded, addAddress, getAddresses };
