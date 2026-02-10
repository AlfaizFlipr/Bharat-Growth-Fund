import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../enum/routes";
import Login from "../pages/auth/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AllUsers from "../pages/allUsers/AllUsers";
import LevelManagement from "../pages/LevelManagment/LevelManagment";
import RechargeManagement from "../pages/RechargeManagement/RechargeManagement";
import WithdrawalManagement from "../pages/WithdrawalManagment/WithdrawalManagment";
import PaymentMethodManagement from "../pages/PaymentMethodManagement/PaymentMethodManagement";
import WithdrawalConfigPage from "../pages/WithdrawalConfig/WithDrawalConfigPage";
import USDWithdrawalManagement from "../pages/USDWithdrawalManagement/USDWithdrawalManagement";
import USDWithdrawalSettingsPage from "../pages/USDWithdrawalManagement/USDWithdrawalSettingsPage";
import TeamReferrals from "../pages/teamManagement/TeamReferrals";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (<ProtectedRoute />) as React.ReactNode,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.ALL_USERS,
        element: <AllUsers />,
      },
      {
        path: ROUTES.LEVELS,
        element: <LevelManagement />,
      },
      {
        path: ROUTES.RECHARGE,
        element: <RechargeManagement />,
      },
      {
        path: ROUTES.WITHDRAWAL,
        element: <WithdrawalManagement />,
      },
      {
        path: ROUTES.USD_WITHDRAWAL,
        element: <USDWithdrawalManagement />,
      },
      {
        path: ROUTES.USD_WITHDRAWAL_SETTINGS,
        element: <USDWithdrawalSettingsPage />,
      },
      {
        path: ROUTES.WITHDRAWAL_CONFIG,
        element: <WithdrawalConfigPage />,
      },
      {
        path: ROUTES.PAYMENT_METHOD,
        element: <PaymentMethodManagement />,
      },
      {
        path: ROUTES.TEAM_REFERRALS,
        element: <TeamReferrals />,
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
]);
