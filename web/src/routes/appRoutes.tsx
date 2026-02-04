import { createBrowserRouter } from "react-router-dom";
import TheLayout from "../layout/TheLayout";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import Home from "../pages/home/Home";
import Level from "../pages/level/Level";
import Profile from "../pages/profile/Profile";
import Login from "../pages/login/Login";
import Signup from "../pages/signup/Signup";
import CompanyIntro from "../pages/company/CompanyIntro";
import CompanyActivities from "../pages/company/CompanyActivities";
import MemberBenefits from "../pages/company/MemberBenefits";
import ManagementPositions from "../pages/company/ManagementPositions";
import FinanceFund from "../pages/company/FinanceFund";
import Recharge from "../pages/company/Recharge";
import WithdrawalScreen from "../pages/withdrawalScreen/WithdrawalScreen";
import USDWithdrawalScreen from "../pages/usdWithdrawalScreen/USDWithdrawalScreen";
import FinancialRecords from "../pages/financialRecords/financialRecords";
import PrivacyPolicy from "../pages/company/PrivacyPolicy";
import IdentityVerificationScreen from "../pages/IdentityVerification/IdentityVerificationScreen";
import Task from "../pages/task/Task";


export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <TheLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/level", element: <Level /> },
          { path: "/profile", element: <Profile /> },
          { path: "/company-intro", element: <CompanyIntro /> },
          { path: "/company-activities", element: <CompanyActivities /> },
          { path: "/member-benefits", element: <MemberBenefits /> },
          { path: "/rewards", element: <Task /> },
          { path: "/management-positions", element: <ManagementPositions /> },
          { path: "/finance-fund", element: <FinanceFund /> },
          { path: "/recharge", element: <Recharge /> },
          { path: "/withdrawal", element: <WithdrawalScreen /> },
          { path: "/usd-withdrawal", element: <USDWithdrawalScreen /> },
          { path: "/financial-records", element: <FinancialRecords /> },
          { path: "/privacy-policy", element: <PrivacyPolicy /> },
          {
            path: "/identity-verification",
            element: <IdentityVerificationScreen />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
]);
