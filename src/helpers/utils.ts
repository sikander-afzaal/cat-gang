export const toHex = (num: number) => {
    const val = Number(num);
    return "0x" + val.toString(16);
};