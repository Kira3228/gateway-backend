export const arrayParser = (arrayString: string): string[] | [] => {
  if (!arrayString) {
    return []
  }
  return arrayString.split(`,`) || []
}