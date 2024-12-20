// addressManager.ts

import prisma from "../lib/prisma"; // Adjust the path based on your project structure

type Address = string; // Using string type for Ethereum addresses

/**
 * Checks if an address has already been added to the claimed list.
 * @param address - The Ethereum address to check.
 * @returns `true` if the address is claimed, otherwise `false`.
 */
const isAddressAdded = async (address: Address): Promise<boolean> => {
  const lowerAddress = address.toLowerCase();
  const existingAddress = await prisma.address.findUnique({
    where: { address: lowerAddress },
  });
  return existingAddress !== null;
};

/**
 * Adds an address to the claimed list.
 * @param address - The Ethereum address to add.
 * @returns `true` if the address was added, `false` if it was already claimed or invalid.
 */
const addAddress = async (address: Address): Promise<boolean> => {
  const lowerAddress = address.toLowerCase();

  try {
    await prisma.address.create({
      data: { address: lowerAddress },
    });
    console.log(`Address ${lowerAddress} has been added to the claimed list.`);
    return true;
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint failed
      console.log(`Address ${lowerAddress} is already in the claimed list.`);
      return false;
    }
    console.error(`Error adding address ${lowerAddress}:`, error);
    return false;
  }
};

/**
 * Retrieves all claimed addresses.
 * @returns An array of claimed Ethereum addresses.
 */
const getAddresses = async (): Promise<Address[]> => {
  const addresses = await prisma.address.findMany({
    select: { address: true },
  });
  return addresses.map((addr: any) => addr.address);
};

export { isAddressAdded, addAddress, getAddresses };
