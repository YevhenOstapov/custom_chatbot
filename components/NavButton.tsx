import { Button, ButtonProps } from "./ui/button";

import { FC } from "react";

interface INavButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  label?: string;
}

const NavButton: FC<INavButtonProps> = ({ icon, label, ...buttonProps }) => {
  return (
    <Button {...buttonProps} variant="ghost" className="dark:text-white">
      <div>{icon}</div>
      {label && <p>{label}</p>}
    </Button>
  );
};
export default NavButton;
