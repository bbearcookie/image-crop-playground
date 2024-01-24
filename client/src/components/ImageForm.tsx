import React, { useEffect, useRef, useState } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import axios from 'axios';
import ReactCrop, {
  convertToPixelCrop,
  makeAspectCrop,
  centerCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import { canvasPreview } from './canvasPreview';
import 'react-image-crop/dist/ReactCrop.css';

const MIN_WIDTH = 150;
const ASPECT = 3 / 4;

const ImageForm = () => {
  const { file, handleChange: handleChangeFile, previewURL } = useFileUpload();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');

  const handleGenerateCroppedImage = async () => {
    const image = imgRef.current;
    const previewCanvas = canvasRef.current;

    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop Canvas가 존재하지 않아요.');
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('2d Context가 존재하지 않아요.');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    blobUrlRef.current = URL.createObjectURL(blob);

    return new File([blob], 'test.png');

    // return new Promise((resolve) => {
    //   const reader = new FileReader();

    //   reader.addEventListener('load', () => {
    //     resolve(reader.result);
    //   });

    //   reader.readAsArrayBuffer(blob);
    // });

    // return blobUrlRef.current;
  };

  const handleLoadImage = (e: React.FormEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 10000,
      },
      ASPECT,
      width,
      height
    );

    const centeredCrop = centerCrop(crop, width, height);
    const pixelCrop = convertToPixelCrop(centeredCrop, width, height);

    setCrop(centeredCrop);
    setCompletedCrop(pixelCrop);
  };

  useEffect(() => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) return;

    canvasPreview(
      imgRef.current,
      canvasRef.current,
      convertToPixelCrop(
        completedCrop,
        imgRef.current.width,
        imgRef.current.height
      )
    );
  }, [completedCrop]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const croppedFile = await handleGenerateCroppedImage();
    console.log(croppedFile);

    const formData = new FormData();

    if (croppedFile) {
      formData.append('file', croppedFile);
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
      {previewURL && (
        <>
          <ReactCrop
            crop={crop}
            onChange={(crop, percentCrop) => setCrop(percentCrop)}
            onComplete={(crop, percentProp) => setCompletedCrop(crop)}
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

          {/* <button onClick={handleDownload}>다운로드</button> */}

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
      <button type="submit">Submit</button>

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
