import React from 'react';
import useImagePreview from '../hooks/useImagePreview';
import useImageCrop from '../hooks/useImageCrop';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import useImageDownload from '../hooks/useImageDownload';
import 'react-image-crop/dist/ReactCrop.css';

const MIN_WIDTH = 150;
const ASPECT = 3 / 4;

const ImageForm = () => {
  const {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imgRef,
    canvasRef,
    handleLoadImage,
    getCurrentOffscreen,
  } = useImageCrop({ aspect: ASPECT });

  const {
    file,
    previewURL,
    handleChange: handleChangeFile,
  } = useImagePreview();
  const { hiddenAnchorRef, handleDownload } = useImageDownload({
    getCurrentOffscreen,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    const blob = await getCurrentOffscreen().convertToBlob({
      type: file.type,
    });

    const croppedFile = new File([blob], file.name);

    const formData = new FormData();
    croppedFile && formData.append('file', croppedFile);
    formData.append('message', '자른 이미지를 서버로 보낼게요');

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
      {previewURL && (
        <>
          <ReactCrop
            key={previewURL}
            crop={crop}
            onChange={(crop, percentCrop) => setCrop(percentCrop)}
            onComplete={(crop) => setCompletedCrop(crop)}
            keepSelection // 새로운 영역 선택하지 못하게 함
            locked // 리사이즈 비활성화
            aspect={ASPECT}
            minWidth={MIN_WIDTH}
          >
            <img
              ref={imgRef}
              src={previewURL}
              alt="preview"
              onLoad={handleLoadImage}
              style={{ maxHeight: '70vh' }}
            />
          </ReactCrop>

          <section className="flex gap-2">
            <button className="bg-gray-200 p-4" type="submit">
              서버로 보내기
            </button>
            <button
              className="bg-gray-200 p-4"
              type="button"
              onClick={() => handleDownload(file?.type)}
            >
              다운로드 하기
            </button>
          </section>

          <a
            href="#hidden"
            ref={hiddenAnchorRef}
            download
            style={{
              visibility: 'hidden',
            }}
          />
        </>
      )}

      {completedCrop && (
        <canvas
          ref={canvasRef}
          style={{
            display: 'none',
            border: '1px solid black',
            width: completedCrop?.width,
            height: completedCrop?.height,
          }}
        />
      )}
    </form>
  );
};

export default ImageForm;
