import { useState, useCallback } from "react";
import { useDropzone, DropzoneProps } from "react-dropzone";
import { formatBytes } from "../lib/utils";

export const DEFAULT_ACCEPTED_MIMES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export interface ImageDropzoneData {
  mime: string;
  size: number;
  dataBase64: string;
  file: File;
}

export interface ImageDropzoneProps {
  label?: string;
  maxSizeBytes?: number;
  acceptedMimes?: { [k: string]: string[] };
  DropzoneProps?: DropzoneProps;
  onRead: (data: ImageDropzoneData) => void;
  onError?: (message: string) => void;
}

export default function ImageDropzone(props: ImageDropzoneProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        setImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }

      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onabort = () => {
          if (props.onError) {
            props.onError("Failed to read file");
          }
        };
        reader.onerror = () => {
          if (props.onError) {
            props.onError("Failed to read file");
          }
        };
        reader.onload = () => {
          const mime = file.type;
          const size = file.size;
          const dataBase64 = reader.result;
          if (typeof dataBase64 === "string") {
            const pos = dataBase64.indexOf(",");
            props.onRead({
              mime,
              size,
              dataBase64: dataBase64.substring(pos + 1),
              file,
            });
          } else if (props.onError) {
            props.onError("Failed to read file");
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [props]
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: props.acceptedMimes ?? DEFAULT_ACCEPTED_MIMES,
    maxSize: props.maxSizeBytes,
    ...props.DropzoneProps,
  });

  return (
    <>
      <div
        className="divider-border border-dashed rounded-xl cursor-pointer"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {!imageUrl && (
          <p className="p-8 text text-center">
            {props.label ?? "Click or drag an image file here"}
          </p>
        )}
        {imageUrl && <img src={imageUrl} alt="" />}
      </div>
      {props.maxSizeBytes !== undefined && (
        <p className="mt-1 text text-xs text-disabled text-end italic">{`Image size cannot exceed ${formatBytes(
          props.maxSizeBytes,
          0
        )}`}</p>
      )}
    </>
  );
}
