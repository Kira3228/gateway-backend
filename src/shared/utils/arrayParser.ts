export const arrayParser = (arrayString: string): string[] | [] => {
  return arrayString.split(`,`) || []
}