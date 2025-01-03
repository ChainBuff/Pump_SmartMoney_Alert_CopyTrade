const getBuyPrice = (amount: bigint, tokenData: any) => {
  if (amount <= 0n) {
    return 0n;
  }

  // Calculate the product of virtual reserves
  let n = tokenData.virtualSolReserves * tokenData.virtualTokenReserves;

  // Calculate the new virtual sol reserves after the purchase
  let i = tokenData.virtualSolReserves + amount;

  // Calculate the new virtual token reserves afttokenData.er the purchase
  let r = n / i + 1;

  // Calculate the amount of tokens to be purchased
  let s = tokenData.virtualTokenReserves - r;

  // Return the minimum of the calculated tokens and real token reserves
  return s < tokenData.realTokenReserves ? s : tokenData.realTokenReserves;
};
export { getBuyPrice };
