
/**
 * Download an HTML file
 * @param html The HTML content to download
 * @param filename The name of the file to download
 */
export const downloadHTML = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
