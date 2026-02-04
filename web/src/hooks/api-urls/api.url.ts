const authPrefix = "/auth/user";

const taskPrefix = "/task";

const withdrawalPrefix = "/withdrawal";

const rechargePrefix = "/recharge"

const levelPrefix = "/level";

const verificationPrefix = "/verification";


export const authUrls = {
  LOGIN: authPrefix + "/login",
  SIGNUP: authPrefix + "/signup",
  VERIFYUSER: authPrefix + "/profile",
  LOGOUT: authPrefix + "/logout",
  UPDATEPROFILE: authPrefix + "/update",
};

export const taskUrls = {
  CREATE_TASK: taskPrefix + "/create-task",
  GET_USER_TASKS: taskPrefix + "/get-task",
  COMPLETE_TASK: taskPrefix + "/complete-tasks",
  GET_TASK_BY_ID: taskPrefix + "/get-single-tasks",
};


export const withdrawalUrls = {
  WALLET_INFO: withdrawalPrefix + "/wallet-info",
  BANK_ACCOUNTS: withdrawalPrefix + "/bank-accounts",
  CREATE_WITHDRAWAL: withdrawalPrefix + "/create",
  WITHDRAWAL_HISTORY: withdrawalPrefix + "/history",
  SET_PASSWORD: withdrawalPrefix + "/set-password",
  CHECK_AVAILABILITY: withdrawalPrefix + "/check-availability",
  WITHDRAWAL_SCHEDULE: withdrawalPrefix + "/schedule",
  QR_CODES: withdrawalPrefix + "/qr-codes",

};

export const rechargeUrls = {
  WALLET_INFO: rechargePrefix + "/wallet-info",
  PAYMENT_METHODS: rechargePrefix + "/payment-methods",
  CREATE_ORDER: rechargePrefix + "/create-order",
  VERIFY_PAYMENT: rechargePrefix + "/verify-payment",
  HISTORY: rechargePrefix + "/history",
  GENERATE_QR: rechargePrefix + "/generate-qr",
  APPROVE: (orderId: string) => rechargePrefix + `/admin/approve/${orderId}`,
  REJECT: (orderId: string) => rechargePrefix + `/admin/reject/${orderId}`,
};

export const levelUrls = {
  GET_ALL: levelPrefix + "/get",
  GET_BY_NAME: (levelName: string) => levelPrefix + `/name/${levelName}`,
  GET_BY_NUMBER: (levelNumber: number) => levelPrefix + `/number/${levelNumber}`,
  UPGRADE_USER: levelPrefix + "/upgrade",
  CREATE_LEVEL: levelPrefix + "/create",
  UPDATE_LEVEL: (levelId: string) => levelPrefix + `/update/${levelId}`,
};


export const verificationUrls = {
  VERIFICATION_STATUS: verificationPrefix + "/status",
  UPLOAD_AADHAAR: verificationPrefix + "/upload-aadhaar",
  UPLOAD_FILE: verificationPrefix + "/upload-photo",
};


const usdWithdrawalPrefix = "/usd-withdrawal";

export const usdWithdrawalUrls = {
  WALLET_INFO: usdWithdrawalPrefix + "/wallet-info",
  CREATE_CONNECT_ACCOUNT: usdWithdrawalPrefix + "/stripe/connect",
  CHECK_CONNECT_STATUS: usdWithdrawalPrefix + "/stripe/status",
  CREATE_WITHDRAWAL: usdWithdrawalPrefix + "/create",
  WITHDRAWAL_HISTORY: usdWithdrawalPrefix + "/history",
  TRANSACTION_HISTORY: usdWithdrawalPrefix + "/transactions",
  
  WITHDRAWAL_METHODS: usdWithdrawalPrefix + "/methods",
  SAVE_BITGET_WALLET: usdWithdrawalPrefix + "/save-bitget-wallet",
};
