export const getYear = (dateInput: any): string => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return !isNaN(date.getTime()) ? date.getFullYear().toString() : "";
};

export const formatPage = (pages: string) => {
  if (!pages) return "";

  if (!pages.includes("-")) return pages;

  const pageRange = pages.split("-");
  if (pageRange.length === 2 && pageRange[0] === pageRange[1]) {
    return pageRange[0];
  }

  const cleanPage = pages.replace("-", "–");
  return cleanPage;
};
