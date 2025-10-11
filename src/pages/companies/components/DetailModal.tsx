import { Modal } from "antd";
import React from "react";

interface DetailModalProps {
  // : string;
  open: boolean;
  setOpen: any;
}

const DetailModal: React.FC<DetailModalProps> = ({ open, setOpen }) => {
  return (
    <>
      <Modal
        title={false}
        closable={false}
        open={open}
        footer={null}
        className="!pt-6"
        width={672}
        centered
      >
        <div>
          <h2 className="text-2xl font-semibold leading-none tracking-tight text-black !mb-2">
            Company Details
          </h2>
          <div className="text-sm text-muted-foreground text-[#768EA7] mb-6">
            This is a placeholder for the job detail view
          </div>
          <p className="text-[#768EA7] text-base !mb-4">
            Full company details would appear here, including company
            description, culture, benefits, open positions, and more.
          </p>
          <button
            className="h-10 cursor-pointer bg-blue-500 !text-white !text-sm !font-medium px-4 py-2 rounded-lg hover:bg-blue-500 transition"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default DetailModal;
