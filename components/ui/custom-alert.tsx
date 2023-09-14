import { FC } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface IAlertProps {
  text: string;
  className?: string;
}
const ErrorAlert: FC<IAlertProps> = ({ text, className }) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-5 w-5" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
};

const SuccessAlert: FC<IAlertProps> = ({ text, className }) => {
  return (
    <Alert variant="success" className={className}>
      <CheckCircle2 className="h-5 w-5" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
};

const CustomAlert = {
  ErrorAlert,
  SuccessAlert,
};

export default CustomAlert;
