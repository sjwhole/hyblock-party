import { Address } from "web3";

// Using a Set for efficient storage and lookup of unique addresses
const claimedAddresses: Set<string> = new Set();

/**
 * Checks if an address has already been added to the claimed list.
 * @param address - The Ethereum address to check.
 * @returns `true` if the address is claimed, otherwise `false`.
 */
const isAddressAdded = (address: Address): boolean => {
  const lowerAddress = address.toLowerCase();
  return claimedAddresses.has(lowerAddress);
};

/**
 * Adds an address to the claimed list.
 * @param address - The Ethereum address to add.
 * @returns `true` if the address was added, `false` if it was already claimed.
 */
const addAddress = (address: Address): boolean => {
  const lowerAddress = address.toLowerCase();

  if (claimedAddresses.has(lowerAddress)) {
    console.log(`Address ${lowerAddress} is already in the claimed list.`);
    return false;
  }

  claimedAddresses.add(lowerAddress);
  console.log(`Address ${lowerAddress} has been added to the claimed list.`);
  return true;
};

/**
 * Retrieves all claimed addresses.
 * @returns An array of claimed Ethereum addresses.
 */
const getAddresses = (): Address[] => {
  return Array.from(claimedAddresses) as Address[];
};

/**
 * Optional: Removes an address from the claimed list.
 * Uncomment and use as needed.
 */
/*
const removeClaimedAddress = (address: Address): boolean => {
  const lowerAddress = address.toLowerCase();
  
  if (claimedAddresses.delete(lowerAddress)) {
    console.log(`Address ${lowerAddress} has been removed from the claimed list.`);
    return true;
  } else {
    console.log(`Address ${lowerAddress} was not found in the claimed list.`);
    return false;
  }
};
*/

export { isAddressAdded, addAddress, getAddresses /*, removeClaimedAddress */ };
