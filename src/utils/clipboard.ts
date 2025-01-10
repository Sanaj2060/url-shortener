import { toast } from "sonner";

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied!", {
          description: "The shortened URL has been copied to your clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        fallbackCopyToClipboard(text);
      });
  } else {
    fallbackCopyToClipboard(text);
  }
};

const fallbackCopyToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    toast.success("Copied!", {
      description: "The shortened URL has been copied to your clipboard.",
    });
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    toast.error("Copy failed", {
      description: "Please copy the URL manually.",
    });
  }
  document.body.removeChild(textArea);
};
