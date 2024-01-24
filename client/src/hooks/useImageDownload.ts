import { useRef } from 'react';

interface useImageDownloadProps {
  getCurrentOffscreen: () => OffscreenCanvas;
}

const useImageDownload = ({ getCurrentOffscreen }: useImageDownloadProps) => {
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');

  const handleDownload = async (mimeType?: string) => {
    if (!hiddenAnchorRef.current) {
      return;
    }

    const blob = await getCurrentOffscreen().convertToBlob({
      type: mimeType,
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    blobUrlRef.current = URL.createObjectURL(blob);
    hiddenAnchorRef.current.setAttribute('href', blobUrlRef.current);
    hiddenAnchorRef.current.click();
  };

  return { handleDownload, hiddenAnchorRef };
};

export default useImageDownload;
