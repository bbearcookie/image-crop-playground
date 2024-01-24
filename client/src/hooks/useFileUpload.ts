import { useState } from 'react';

const useFileUpload = () => {
  const [file, setFile] = useState<File>();
  const [previewURL, setPreviewURL] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const reader = new FileReader();

    reader.onload = () => {
      setPreviewURL(reader.result as string);
    };

    const file = e.target.files[0];
    setFile(file);
    reader.readAsDataURL(file);
  };

  return { file, previewURL, handleChange };
};

export default useFileUpload;
