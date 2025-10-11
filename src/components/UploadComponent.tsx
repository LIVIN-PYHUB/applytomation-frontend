import React from "react";

import { Upload, Form, message } from "antd";
import type { UploadProps } from "antd";
import { File, LucideUpload, XCircleIcon } from "lucide-react";
import { getFileSize } from "../utills/Constants";

type FieldType = {
  file?: any;
};
interface UploadComponentProps extends UploadProps {
  fieldName: any; // Name of the form item
  accept?: string; // File types that the component should accept
  maxCount?: any;
  multiple?: boolean;
  onChange?: (value: any) => void;
  statementUpload?: boolean;
  fieldLabel?: string;
  disabled?: boolean;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  fieldName,
  accept,
  maxCount,
  multiple,
  onChange,
  statementUpload,
  fieldLabel,
  disabled,
}) => {
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const beforeUpload = (file: any, fileList: any[]) => {
    const maxSize = 12 * 1024 * 1024; // 15 MB in bytes
    // Correct extension check for .xlsx, .xls, .csv, .txt
    const isValidType = ["xlsx", ".xls", ".csv", ".txt"].includes(
      file.name.toLowerCase().slice(-4)
    );

    if (!isValidType) {
      message.error("User can only upload .xlsx, .xls, .csv, or .txt files!");
      return Upload.LIST_IGNORE; // Prevent upload
    }
    // Check max count
    if (fileList.length > maxCount) {
      message.error(`User can only upload up to ${maxCount} files.`);
      return Upload.LIST_IGNORE; // Prevent exceeding max files
    }
  };
  return (
    <Form.Item<FieldType>
      name={fieldName}
      label={fieldLabel}
      getValueFromEvent={normFile}
      className="mb-0"
      rules={[
        {
          required: true,
          message: "Please  Upload a File!",
        },
      ]}
    >
      {/* <UploadComponent /> */}
      <Upload.Dragger
        disabled={disabled ?? false}
        name="files"
        accept={accept}
        className="!bg-white"
        onChange={onChange}
        itemRender={(_OriginalNode, file: any, _fileList, { remove }) => {
          return (
            <>
              <div className="flex items-center justify-between p-3 border border-[#f0f0f0] mt-2 rounded-lg">
                <div className="flex flex-row items-center gap-x-2">
                  <a
                    href={URL.createObjectURL(file?.originFileObj as Blob)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clickable"
                  >
                    <File className="text-[#768EA7]"/>
                  </a>

                  <div className="custom-file-name">
                    <a
                      href={URL.createObjectURL(file?.originFileObj as Blob)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-normal !text-[#768EA7]"
                    >
                      {file?.name}
                    </a>
                    <div className="text-[#768EA7] text-[12px] font-medium">
                      {getFileSize(file?.size)}
                    </div>
                  </div>
                </div>
                <div onClick={() => remove()} className="pt-2">
                  <XCircleIcon className="h-4 w-4 text-[#768EA7]" />
                </div>
              </div>
            </>
          );
        }}
        multiple={multiple}
        maxCount={maxCount}
        //beforeUpload={() => false}
        beforeUpload={beforeUpload}
      >
        <div
          className={`flex border-[#f0f0f0] !bg-white  flex-col gap-x-2 m-auto items-center justify-center py-4 md:py-8`}
        >
          <div>
            <LucideUpload className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-[#768EA7]" />
          </div>

          <p className="text-xs md:text-sm text-[#768EA7] !mb-1 md:!mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs  text-[#768EA7]">
            PDF, DOC, DOCX (Max 5MB)
          </p>
          
        </div>
      </Upload.Dragger>
    </Form.Item>
  );
};

export default UploadComponent;
