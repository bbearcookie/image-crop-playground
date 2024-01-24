import React from 'react';
import useFileUpload from '../hooks/useFileUpload';
import axios from 'axios';

const ImageForm = () => {
  const { file, handleChange: handleChangeFile, previewURL } = useFileUpload();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(file);

    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }
    formData.append('name', 'test');

    const res = await axios.post('http://localhost:5010/upload', formData);
    console.log(res);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={handleChangeFile}
        multiple
      />
      <img src={previewURL} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ImageForm;
