import { Outlet } from "react-router-dom";
import { QolAssessmentProvider } from "./QolAssessmentContext";

const QolLayout = () => {
  return (
    <QolAssessmentProvider>
      <Outlet />
    </QolAssessmentProvider>
  );
};

export default QolLayout;
