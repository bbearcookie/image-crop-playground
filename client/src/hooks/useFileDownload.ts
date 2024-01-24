import { useRef } from 'react';

interface useFileDownloadProps {
  getCurrentOffscreen: () => OffscreenCanvas;
}

const useFileDownload = ({ getCurrentOffscreen }: useFileDownloadProps) => {
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');

  const handleDownload = async () => {
    if (!hiddenAnchorRef.current) {
      return;
    }

    const blob = await getCurrentOffscreen().convertToBlob({
      type: 'image/png',
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

export default useFileDownload;
