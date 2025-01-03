import { PublicKey } from "@solana/web3.js";

const BONDING_CURVE_SEED = "bonding-curve";
function getBondingCurvePDA(mint: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
    programId
  )[0];
}
export default getBondingCurvePDA;
