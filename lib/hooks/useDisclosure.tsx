import React, { useState } from "react";

const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen((prev) => (prev = true));
  };

  const onClose = () => {
    setIsOpen((prev) => (prev = false));
  };

  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return { isOpen, onOpen, onClose, onToggle };
};

export default useDisclosure;
