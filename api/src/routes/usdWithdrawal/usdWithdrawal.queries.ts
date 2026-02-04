
import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import usdWithdrawalController from '../../controllers/usdWithdrawalControllers/usdWithdrawal.controller';

const {
    
    getUSDWalletInfo,
    saveBitgetWalletAddress,
    getWithdrawalMethods,
    createStripeConnectAccount,
    checkStripeConnectStatus,
    createUSDWithdrawal,
    getUSDWithdrawalHistory,
    getUSDTransactionHistory,
    
    getWithdrawalSettingsAdmin,
    updateWithdrawalSettings,
    testBitgetConnection,
    toggleUSDUserStatus,
    fundUSDWallet,
    getAllUSDWithdrawals,
    approveUSDWithdrawal,
    rejectUSDWithdrawal,
    getUSDWalletByUserId,
    checkBitgetWithdrawalStatus,
} = usdWithdrawalController;

export default (router: Router) => {
    
    router.get('/wallet-info', commonsMiddleware.checkUserAuth, getUSDWalletInfo);
    router.post('/save-bitget-wallet', commonsMiddleware.checkUserAuth, saveBitgetWalletAddress);
    router.get('/methods', commonsMiddleware.checkUserAuth, getWithdrawalMethods);
    router.post('/stripe/connect', commonsMiddleware.checkUserAuth, createStripeConnectAccount);
    router.get('/stripe/status', commonsMiddleware.checkUserAuth, checkStripeConnectStatus);
    router.post('/create', commonsMiddleware.checkUserAuth, createUSDWithdrawal);
    router.get('/history', commonsMiddleware.checkUserAuth, getUSDWithdrawalHistory);
    router.get('/transactions', commonsMiddleware.checkUserAuth, getUSDTransactionHistory);

    
    router.get('/admin/settings', commonsMiddleware.checkAdminAuth, getWithdrawalSettingsAdmin);
    router.patch('/admin/settings', commonsMiddleware.checkAdminAuth, updateWithdrawalSettings);
    router.get('/admin/test-bitget', commonsMiddleware.checkAdminAuth, testBitgetConnection);
    router.patch('/admin/toggle-user/:userId', commonsMiddleware.checkAdminAuth, toggleUSDUserStatus);
    router.post('/admin/fund-wallet/:userId', commonsMiddleware.checkAdminAuth, fundUSDWallet);
    router.get('/admin/withdrawals', commonsMiddleware.checkAdminAuth, getAllUSDWithdrawals);
    router.patch('/admin/approve/:withdrawalId', commonsMiddleware.checkAdminAuth, approveUSDWithdrawal);
    router.patch('/admin/reject/:withdrawalId', commonsMiddleware.checkAdminAuth, rejectUSDWithdrawal);
    router.get('/admin/wallet/:userId', commonsMiddleware.checkAdminAuth, getUSDWalletByUserId);
    router.get('/admin/bitget-status/:withdrawalId', commonsMiddleware.checkAdminAuth, checkBitgetWithdrawalStatus);
};
