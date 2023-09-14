import { FC } from "react";
import { SheetContent, SheetHeader, SheetTitle, Sheet } from "./ui/sheet";

interface INewDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  header?: string | React.ReactNode;
}

const NewDrawer: FC<INewDrawerProps> = ({
  children,
  isOpen,
  onClose,
  header,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{header}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
};
export default NewDrawer;
