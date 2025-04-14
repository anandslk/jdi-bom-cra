import { atom, useAtom } from "jotai";

const productAtom = atom(false);

export const useConfirmations = () => {
  const [isOpen, setIsOpen] = useAtom(productAtom);

  return {
    isOpen,
    setIsOpen,
  };
};
