import { useEffect, useRef, useState } from 'react';
import {
  convertToPixelCrop,
  makeAspectCrop,
  centerCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import { canvasPreview } from '../utils/canvasPreview';

interface useImageCropProps {
  aspect?: number;
}

const useImageCrop = ({ aspect = 3 / 4 }: useImageCropProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** 현재 선택된 영역을 잘라서 blob 이미지로 반환 */
  const generateCroppedImage = async () => {
    const image = imgRef.current;
    const previewCanvas = canvasRef.current;

    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop Canvas가 존재하지 않아요.');
    }

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

    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    return new File([blob], 'test.png');
  };

  /** 이미지 로드시 기본 crop 설정 */
  const handleLoadImage = (e: React.FormEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 10000,
      },
      aspect,
      width,
      height
    );

    const centeredCrop = centerCrop(crop, width, height);
    const pixelCrop = convertToPixelCrop(centeredCrop, width, height);

    setCrop(centeredCrop);
    setCompletedCrop(pixelCrop);
  };

  /** completedCrop 변경시 자동으로 미리보기 캔버스 그리기  */
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

  return {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imgRef,
    canvasRef,
    handleLoadImage,
    generateCroppedImage,
  };
};

export default useImageCrop;
