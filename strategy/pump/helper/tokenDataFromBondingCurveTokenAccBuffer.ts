import { BN } from "@coral-xyz/anchor";
import { struct, bool, u64, Layout } from "@coral-xyz/borsh";
const fromBuffer = (buffer: Buffer) => {
  const structure = struct([
    u64("discriminator"),
    u64("virtualTokenReserves"),
    u64("virtualSolReserves"),
    u64("realTokenReserves"),
    u64("realSolReserves"),
    u64("tokenTotalSupply"),
    bool("complete"),
  ]);

  let value = structure.decode(buffer);

  return {
    discriminator: new BN(value.discriminator),
    virtualTokenReserves: new BN(value.virtualTokenReserves),
    virtualSolReserves: new BN(value.virtualSolReserves),
    realTokenReserves: new BN(value.realTokenReserves),
    realSolReserves: new BN(value.realSolReserves),
    tokenTotalSupply: new BN(value.tokenTotalSupply),
    complete: value.complete,
  };
};
export { fromBuffer as tokenDataFromBondingCurveTokenAccBuffer };
