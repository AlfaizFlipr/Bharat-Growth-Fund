
import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';
import stripeService from '../../services/stripe.service';
import bitgetService, { BitgetService } from '../../services/bitget.service';

const { JsonResponse } = commonsUtils;



/**
 * Get withdrawal settings (creates default if not exists)
 */
const getWithdrawalSettings = async () => {
    let settings = await models.WithdrawalSettings.findOne();

    if (!settings) {
        settings = await models.WithdrawalSettings.create({
            stripeEnabled: false,
            bitgetEnabled: true,
            bitgetApiKey: process.env.BITGET_API_KEY || '',
            bitgetSecretKey: process.env.BITGET_SECRET_KEY || '',
            bitgetPassphrase: process.env.BITGET_PASSPHRASE || '',
            bitgetNetwork: 'trc20', 
            bitgetCurrency: 'USDT',
            defaultWithdrawalMethod: 'bitget',
        });
    }

    return settings;
};

/**
 * Get Bitget service with updated credentials from settings
 * Prioritizes .env values if they exist, otherwise uses database settings
 */
const getBitgetServiceWithSettings = async () => {
    const settings = await getWithdrawalSettings();

    
    const apiKey = process.env.BITGET_API_KEY || settings.bitgetApiKey;
    const secretKey = process.env.BITGET_SECRET_KEY || settings.bitgetSecretKey;
    const passphrase = process.env.BITGET_PASSPHRASE || settings.bitgetPassphrase;

    const bitget = new BitgetService(apiKey as string, secretKey as string, passphrase as string);
    return { bitget, settings };
};

/**
 * Get exchange rate (from settings or service)
 */
const getExchangeRate = async () => {
    const settings = await getWithdrawalSettings();
    return settings.usdExchangeRate || 83;
};

/**
 * Convert INR to USD
 */
const convertINRtoUSD = (amountINR: number, exchangeRate: number): number => {
    return Number((amountINR / exchangeRate).toFixed(2));
};



/**
 * Get USD Wallet Info for a user
 */
export const getUSDWalletInfo = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;

        const user = await models.User.findById(userId).select('isUSDUser name phone');
        if (!user) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 404,
                message: 'User not found.',
                title: 'USD Wallet',
            });
        }

        if (!user.isUSDUser) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 403,
                message: 'You are not enabled for USD withdrawals.',
                title: 'USD Wallet',
            });
        }

        
        const settings = await getWithdrawalSettings();
        const exchangeRate = settings.usdExchangeRate || 83;

        
        let usdWallet = await models.USDWallet.findOne({ userId });

        if (!usdWallet) {
            usdWallet = await models.USDWallet.create({
                userId,
                balanceINR: 0,
                balanceUSD: 0,
                lastExchangeRate: exchangeRate,
            });
        }

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'USD Wallet',
            message: 'USD wallet info retrieved successfully.',
            data: {
                wallet: {
                    balanceINR: (usdWallet as any).balanceINR,
                    balanceUSD: (usdWallet as any).balanceUSD,
                    totalFundedINR: (usdWallet as any).totalFundedINR,
                    totalWithdrawnUSD: (usdWallet as any).totalWithdrawnUSD,
                    
                    stripeConnectStatus: (usdWallet as any).stripeConnectStatus,
                    stripeOnboardingComplete: (usdWallet as any).stripeOnboardingComplete,
                    
                    bitgetWalletAddress: (usdWallet as any).bitgetWalletAddress,
                    bitgetNetwork: (usdWallet as any).bitgetNetwork,
                    bitgetVerified: (usdWallet as any).bitgetVerified,
                    
                    preferredWithdrawalMethod: (usdWallet as any).preferredWithdrawalMethod,
                },
                currentExchangeRate: exchangeRate,
                isUSDUser: true,
                
                withdrawalMethods: {
                    stripeEnabled: settings.stripeEnabled,
                    bitgetEnabled: settings.bitgetEnabled,
                    defaultMethod: settings.defaultWithdrawalMethod,
                    bitgetNetwork: settings.bitgetNetwork,
                    bitgetCurrency: settings.bitgetCurrency,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching USD wallet info:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while fetching USD wallet info.',
            title: 'USD Wallet',
        });
    }
};

/**
 * Save/Update Bitget Wallet Address
 */
export const saveBitgetWalletAddress = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;
        const { walletAddress, network } = req.body;

        if (!walletAddress) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Wallet address is required.',
                title: 'Bitget Wallet',
            });
        }

        const settings = await getWithdrawalSettings();
        const selectedNetwork = network || settings.bitgetNetwork || 'trc20';

        
        const isValidAddress = bitgetService.validateAddress(walletAddress, selectedNetwork);
        if (!isValidAddress) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: `Invalid wallet address format for ${selectedNetwork} network.`,
                title: 'Bitget Wallet',
            });
        }

        const user = await models.User.findById(userId).select('isUSDUser');
        if (!user || !user.isUSDUser) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 403,
                message: 'You are not enabled for USD withdrawals.',
                title: 'Bitget Wallet',
            });
        }

        let usdWallet = await models.USDWallet.findOne({ userId });
        if (!usdWallet) {
            const exchangeRate = await getExchangeRate();
            usdWallet = await models.USDWallet.create({
                userId,
                lastExchangeRate: exchangeRate,
            });
        }

        (usdWallet as any).bitgetWalletAddress = walletAddress;
        (usdWallet as any).bitgetNetwork = selectedNetwork;
        (usdWallet as any).bitgetVerified = true;
        (usdWallet as any).preferredWithdrawalMethod = 'bitget';
        await usdWallet.save();

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Bitget Wallet',
            message: 'Bitget wallet address saved successfully.',
            data: {
                bitgetWalletAddress: (usdWallet as any).bitgetWalletAddress,
                bitgetNetwork: (usdWallet as any).bitgetNetwork,
                bitgetVerified: (usdWallet as any).bitgetVerified,
            },
        });
    } catch (error) {
        console.error('Error saving Bitget wallet address:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while saving wallet address.',
            title: 'Bitget Wallet',
        });
    }
};

/**
 * Get available withdrawal methods for user
 */
export const getWithdrawalMethods = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;
        const settings = await getWithdrawalSettings();

        const usdWallet = await models.USDWallet.findOne({ userId });

        const methods = [];

        
        if (settings.stripeEnabled) {
            methods.push({
                method: 'stripe',
                name: 'Stripe (Bank Transfer)',
                enabled: true,
                configured: (usdWallet as any)?.stripeOnboardingComplete || false,
                fee: `${settings.stripeFeePercent}%`,
                description: 'Withdraw to your bank account via Stripe',
            });
        }

        
        if (settings.bitgetEnabled) {
            methods.push({
                method: 'bitget',
                name: `Bitget (${settings.bitgetCurrency} - ${settings.bitgetNetwork})`,
                enabled: true,
                configured: (usdWallet as any)?.bitgetVerified || false,
                walletAddress: (usdWallet as any)?.bitgetWalletAddress || null,
                network: settings.bitgetNetwork,
                currency: settings.bitgetCurrency,
                fee: `${settings.bitgetFeePercent}%`,
                description: `Withdraw ${settings.bitgetCurrency} to your crypto wallet`,
            });
        }

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Withdrawal Methods',
            message: 'Available withdrawal methods retrieved.',
            data: {
                methods,
                defaultMethod: settings.defaultWithdrawalMethod,
                preferredMethod: (usdWallet as any)?.preferredWithdrawalMethod || settings.defaultWithdrawalMethod,
            },
        });
    } catch (error) {
        console.error('Error fetching withdrawal methods:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while fetching withdrawal methods.',
            title: 'Withdrawal Methods',
        });
    }
};

/**
 * Create Stripe Connect Account for USD user
 */
export const createStripeConnectAccount = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;
        const { email, returnUrl, refreshUrl } = req.body;

        
        const settings = await getWithdrawalSettings();
        if (!settings.stripeEnabled) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Stripe withdrawals are currently disabled. Please use Bitget.',
                title: 'Stripe Connect',
            });
        }

        const user = await models.User.findById(userId).select('isUSDUser name');
        if (!user || !(user as any).isUSDUser) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 403,
                message: 'You are not enabled for USD withdrawals.',
                title: 'Stripe Connect',
            });
        }

        const exchangeRate = await getExchangeRate();
        let usdWallet = await models.USDWallet.findOne({ userId });

        if (!usdWallet) {
            usdWallet = await models.USDWallet.create({
                userId,
                lastExchangeRate: exchangeRate,
            });
        }

        
        if ((usdWallet as any).stripeConnectAccountId && (usdWallet as any).stripeOnboardingComplete) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Stripe Connect account already set up.',
                title: 'Stripe Connect',
            });
        }

        let accountId = (usdWallet as any).stripeConnectAccountId;

        
        if (!accountId) {
            const account = await stripeService.createConnectAccount(email, {
                userId: userId.toString(),
            });
            accountId = account.id;

            (usdWallet as any).stripeConnectAccountId = accountId;
            (usdWallet as any).stripeConnectStatus = 'pending';
            await usdWallet.save();
        }

    const ensureProtocol = (u?: string) => {
      if (!u) return u;
      if (/^https?:\/\//i.test(u)) return u;
      return `http://${u}`;
    };

       
    const defaultRefresh = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/usd-withdrawal?refresh=true`;
    const defaultReturn = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/usd-withdrawal?success=true`;

        const finalRefreshUrl: string = ensureProtocol(refreshUrl) || ensureProtocol(defaultRefresh) || defaultRefresh;
        const finalReturnUrl: string = ensureProtocol(returnUrl) || ensureProtocol(defaultReturn) || defaultReturn;

        const accountLink = await stripeService.createAccountLink(
            accountId as string,
            finalRefreshUrl,
            finalReturnUrl
        );

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Stripe Connect',
            message: 'Onboarding link created successfully.',
            data: {
                onboardingUrl: accountLink.url,
                accountId,
            },
        });
    } catch (error) {
        console.error('Error creating Stripe Connect account:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while setting up Stripe Connect.',
            title: 'Stripe Connect',
        });
    }
};

/**
 * Check Stripe Connect Account Status
 */
export const checkStripeConnectStatus = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;

        const usdWallet = await models.USDWallet.findOne({ userId });

        if (!usdWallet || !(usdWallet as any).stripeConnectAccountId) {
            return JsonResponse(res, {
                status: 'success',
                statusCode: 200,
                title: 'Stripe Connect',
                message: 'No Stripe Connect account found.',
                data: {
                    connected: false,
                    status: 'not_connected',
                },
            });
        }

        const isOnboarded = await stripeService.isAccountOnboarded(
            (usdWallet as any).stripeConnectAccountId as string
        );

        if (isOnboarded && !(usdWallet as any).stripeOnboardingComplete) {
            (usdWallet as any).stripeOnboardingComplete = true;
            (usdWallet as any).stripeConnectStatus = 'connected';
            await usdWallet.save();
        }

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Stripe Connect',
            message: 'Stripe Connect status retrieved.',
            data: {
                connected: isOnboarded,
                status: (usdWallet as any).stripeConnectStatus,
                accountId: (usdWallet as any).stripeConnectAccountId,
            },
        });
    } catch (error) {
        console.error('Error checking Stripe Connect status:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while checking Stripe Connect status.',
            title: 'Stripe Connect',
        });
    }
};

/**
 * Create USD Withdrawal Request
 * Supports both Stripe and Bitget based on settings
 */
export const createUSDWithdrawal = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;
        const { amountINR, withdrawalMethod } = req.body;

        if (!amountINR || amountINR <= 0) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Invalid withdrawal amount.',
                title: 'USD Withdrawal',
            });
        }

        const user = await models.User.findById(userId).select('isUSDUser');
        if (!user || !(user as any).isUSDUser) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 403,
                message: 'You are not enabled for USD withdrawals.',
                title: 'USD Withdrawal',
            });
        }

        const usdWallet = await models.USDWallet.findOne({ userId });
        if (!usdWallet) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 404,
                message: 'USD wallet not found.',
                title: 'USD Withdrawal',
            });
        }

        
        const settings = await getWithdrawalSettings();
        const selectedMethod = withdrawalMethod || (usdWallet as any).preferredWithdrawalMethod || settings.defaultWithdrawalMethod;

        
        if (selectedMethod === 'stripe' && !settings.stripeEnabled) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Stripe withdrawals are currently disabled.',
                title: 'USD Withdrawal',
            });
        }

        if (selectedMethod === 'bitget' && !settings.bitgetEnabled) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Bitget withdrawals are currently disabled.',
                title: 'USD Withdrawal',
            });
        }

        
        if (selectedMethod === 'stripe') {
            if (!(usdWallet as any).stripeConnectAccountId || !(usdWallet as any).stripeOnboardingComplete) {
                return JsonResponse(res, {
                    status: 'error',
                    statusCode: 400,
                    message: 'Please complete Stripe Connect setup first.',
                    title: 'USD Withdrawal',
                });
            }
        } else if (selectedMethod === 'bitget') {
            if (!(usdWallet as any).bitgetWalletAddress || !(usdWallet as any).bitgetVerified) {
                return JsonResponse(res, {
                    status: 'error',
                    statusCode: 400,
                    message: 'Please add and verify your Bitget wallet address first.',
                    title: 'USD Withdrawal',
                });
            }
        }

        const exchangeRate = settings.usdExchangeRate || 83;
        const amountUSD = convertINRtoUSD(amountINR, exchangeRate);

        
        if ((usdWallet as any).balanceINR < amountINR) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: `Insufficient balance. Available: ₹${(usdWallet as any).balanceINR.toLocaleString()} ($${(usdWallet as any).balanceUSD.toFixed(2)})`,
                title: 'USD Withdrawal',
            });
        }

        
        const minWithdrawal = settings.minWithdrawalINR || 100;
        if (amountINR < minWithdrawal) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: `Minimum withdrawal amount is ₹${minWithdrawal}.`,
                title: 'USD Withdrawal',
            });
        }

        
        const maxWithdrawal = settings.maxWithdrawalINR || 500000;
        if (amountINR > maxWithdrawal) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: `Maximum withdrawal amount is ₹${maxWithdrawal.toLocaleString()}.`,
                title: 'USD Withdrawal',
            });
        }

        
        if (selectedMethod === 'bitget') {
            const network = (usdWallet as any)?.bitgetNetwork || settings.bitgetNetwork || 'trc20';

            const bitgetMinimums: Record<string, number> = {
                'trc20': 10,
                'bep20': 10,
                'erc20': 10,
                'polygon': 10,
                'arbitrumone': 10,
                'sol': 10,
                'ton': 10,
                'aptos': 10,
            };

            const minBitgetUSD = bitgetMinimums[network.toLowerCase()] || 10;
            const minBitgetINR = minBitgetUSD * exchangeRate;

            const feePercent = settings.bitgetFeePercent || 0.1;
            const netAmountUSD = amountUSD - (amountUSD * feePercent / 100);

            if (netAmountUSD < minBitgetUSD) {
                return JsonResponse(res, {
                    status: 'error',
                    statusCode: 400,
                    message: `Withdrawal amount is below Bitget's minimum. After fees, you would withdraw $${netAmountUSD.toFixed(2)} USDT, but ${network.toUpperCase()} network requires minimum $${minBitgetUSD} USDT.`,
                    title: 'USD Withdrawal',
                });
            }
        }

        
        const withdrawalData: any = {
            userId,
            amountINR,
            amountUSD,
            exchangeRate,
            withdrawalMethod: selectedMethod,
            status: 'pending',
        };

        
        if (selectedMethod === 'bitget') {
            withdrawalData.bitgetWalletAddress = (usdWallet as any).bitgetWalletAddress;
            withdrawalData.bitgetNetwork = (usdWallet as any).bitgetNetwork || settings.bitgetNetwork;
            withdrawalData.bitgetCurrency = settings.bitgetCurrency;
        }

        const withdrawal = await models.USDWithdrawal.create(withdrawalData) as any;

        
        (usdWallet as any).balanceINR -= amountINR;
        (usdWallet as any).balanceUSD = convertINRtoUSD((usdWallet as any).balanceINR, exchangeRate);
        await usdWallet.save();

        
        await models.USDWalletTransaction.create({
            userId,
            type: 'debit',
            amountINR,
            amountUSD,
            exchangeRate,
            description: `USD Withdrawal Request #${withdrawal._id.toString().slice(-8)} (${selectedMethod.toUpperCase()})`,
            referenceType: 'withdrawal',
            referenceId: withdrawal._id,
            balanceAfterINR: (usdWallet as any).balanceINR,
            balanceAfterUSD: (usdWallet as any).balanceUSD,
        });

        return JsonResponse(res, {
            status: 'success',
            statusCode: 201,
            title: 'USD Withdrawal',
            message: 'Withdrawal request created successfully.',
            data: {
                withdrawal: {
                    _id: withdrawal._id,
                    amountUSD: withdrawal.amountUSD,
                    amountINR: withdrawal.amountINR,
                    exchangeRate: withdrawal.exchangeRate,
                    withdrawalMethod: withdrawal.withdrawalMethod,
                    status: withdrawal.status,
                    createdAt: withdrawal.createdAt,
                },
            },
        });
    } catch (error) {
        console.error('Error creating USD withdrawal:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while creating withdrawal request.',
            title: 'USD Withdrawal',
        });
    }
};

/**
 * Get USD Withdrawal History for user
 */
export const getUSDWithdrawalHistory = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;
        const { page = 1, limit = 10, status } = req.query;

        const query: any = { userId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [withdrawals, totalCount] = await Promise.all([
            models.USDWithdrawal.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            models.USDWithdrawal.countDocuments(query),
        ]);

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'USD Withdrawal History',
            message: 'Withdrawal history retrieved successfully.',
            data: {
                withdrawals,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                    totalCount,
                    limit: Number(limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching USD withdrawal history:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while fetching withdrawal history.',
            title: 'USD Withdrawal History',
        });
    }
};

/**
 * Get USD Wallet Transaction History
 */
export const getUSDTransactionHistory = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const userId = res.locals.userId;
        const { page = 1, limit = 10, type } = req.query;

        const query: any = { userId };
        if (type && type !== 'all') {
            query.type = type;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [transactions, totalCount] = await Promise.all([
            models.USDWalletTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            models.USDWalletTransaction.countDocuments(query),
        ]);

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'USD Transaction History',
            message: 'Transaction history retrieved successfully.',
            data: {
                transactions,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / Number(limit)),
                    totalCount,
                    limit: Number(limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching USD transaction history:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while fetching transaction history.',
            title: 'USD Transaction History',
        });
    }
};



/**
 * Get Withdrawal Settings (Admin)
 */
export const getWithdrawalSettingsAdmin = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const settings = await getWithdrawalSettings();

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Withdrawal Settings',
            message: 'Settings retrieved successfully.',
            data: {
                settings: {
                    stripeEnabled: settings.stripeEnabled,
                    bitgetEnabled: settings.bitgetEnabled,
                    bitgetNetwork: settings.bitgetNetwork,
                    bitgetCurrency: settings.bitgetCurrency,
                    usdExchangeRate: settings.usdExchangeRate,
                    minWithdrawalINR: settings.minWithdrawalINR,
                    maxWithdrawalINR: settings.maxWithdrawalINR,
                    stripeFeePercent: settings.stripeFeePercent,
                    bitgetFeePercent: settings.bitgetFeePercent,
                    defaultWithdrawalMethod: settings.defaultWithdrawalMethod,
                    notes: settings.notes,
                    bitgetApiKeyConfigured: !!settings.bitgetApiKey,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching withdrawal settings:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while fetching settings.',
            title: 'Withdrawal Settings',
        });
    }
};

/**
 * Update Withdrawal Settings (Admin)
 */
export const updateWithdrawalSettings = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const adminId = res.locals.adminId;
        const {
            stripeEnabled,
            bitgetEnabled,
            bitgetApiKey,
            bitgetSecretKey,
            bitgetPassphrase,
            bitgetNetwork,
            bitgetCurrency,
            usdExchangeRate,
            minWithdrawalINR,
            maxWithdrawalINR,
            stripeFeePercent,
            bitgetFeePercent,
            defaultWithdrawalMethod,
            notes,
        } = req.body;

        let settings = await models.WithdrawalSettings.findOne();

        if (!settings) {
            settings = new models.WithdrawalSettings();
        }

        if (typeof stripeEnabled === 'boolean') settings.stripeEnabled = stripeEnabled;
        if (typeof bitgetEnabled === 'boolean') settings.bitgetEnabled = bitgetEnabled;
        if (bitgetApiKey) settings.bitgetApiKey = bitgetApiKey;
        if (bitgetSecretKey) settings.bitgetSecretKey = bitgetSecretKey;
        if (bitgetPassphrase) settings.bitgetPassphrase = bitgetPassphrase;
        if (bitgetNetwork) settings.bitgetNetwork = bitgetNetwork;
        if (bitgetCurrency) settings.bitgetCurrency = bitgetCurrency;
        if (usdExchangeRate) settings.usdExchangeRate = usdExchangeRate;
        if (minWithdrawalINR) settings.minWithdrawalINR = minWithdrawalINR;
        if (maxWithdrawalINR) settings.maxWithdrawalINR = maxWithdrawalINR;
        if (stripeFeePercent !== undefined) settings.stripeFeePercent = stripeFeePercent;
        if (bitgetFeePercent !== undefined) settings.bitgetFeePercent = bitgetFeePercent;
        if (defaultWithdrawalMethod) settings.defaultWithdrawalMethod = defaultWithdrawalMethod;
        if (notes !== undefined) settings.notes = notes;

        (settings as any).updatedBy = adminId;
        await settings.save();

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Withdrawal Settings',
            message: 'Settings updated successfully.',
            data: {
                settings: {
                    stripeEnabled: settings.stripeEnabled,
                    bitgetEnabled: settings.bitgetEnabled,
                    bitgetNetwork: settings.bitgetNetwork,
                    bitgetCurrency: settings.bitgetCurrency,
                    usdExchangeRate: settings.usdExchangeRate,
                    defaultWithdrawalMethod: settings.defaultWithdrawalMethod,
                },
            },
        });
    } catch (error) {
        console.error('Error updating withdrawal settings:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while updating settings.',
            title: 'Withdrawal Settings',
        });
    }
};

/**
 * Test Bitget Connection (Admin)
 */
export const testBitgetConnection = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const { bitget, settings } = await getBitgetServiceWithSettings();

        const apiKey = process.env.BITGET_API_KEY || settings.bitgetApiKey;
        const secretKey = process.env.BITGET_SECRET_KEY || settings.bitgetSecretKey;
        const passphrase = process.env.BITGET_PASSPHRASE || settings.bitgetPassphrase;

        if (!apiKey || !secretKey || !passphrase) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Bitget API credentials are not configured.',
                title: 'Bitget Connection',
            });
        }

        let serverIP = 'Unknown';
        try {
            serverIP = await bitget.getServerPublicIP();
        } catch (ipError) { }

        const balances = await bitget.getAccountBalances();
        const usdtBalance = balances.find((b: any) =>
            b.coin?.toUpperCase() === settings.bitgetCurrency?.toUpperCase() ||
            b.coinName?.toUpperCase() === settings.bitgetCurrency?.toUpperCase()
        );

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Bitget Connection',
            message: 'Bitget connection successful.',
            data: {
                connected: true,
                serverIP,
                currency: settings.bitgetCurrency,
                network: settings.bitgetNetwork,
                balance: usdtBalance ? {
                    available: usdtBalance.available,
                    frozen: usdtBalance.frozen,
                    free: usdtBalance.available,
                } : null,
            },
        });
    } catch (error: any) {
        console.error('Bitget connection test failed:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 400,
            message: `Bitget connection failed: ${error.message || 'Unknown error'}`,
            title: 'Bitget Connection',
        });
    }
};

/**
 * Toggle USD User Status (Admin)
 */
export const toggleUSDUserStatus = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const { userId } = req.params;
        const { isUSDUser } = req.body;

        const user = await models.User.findById(userId);
        if (!user) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 404,
                message: 'User not found.',
                title: 'USD User Toggle',
            });
        }

        (user as any).isUSDUser = isUSDUser;
        await user.save();

        if (isUSDUser) {
            const existingWallet = await models.USDWallet.findOne({ userId });
            if (!existingWallet) {
                const exchangeRate = await getExchangeRate();
                await models.USDWallet.create({
                    userId,
                    lastExchangeRate: exchangeRate,
                });
            }
        }

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'USD User Toggle',
            message: `User ${isUSDUser ? 'enabled' : 'disabled'} for USD withdrawals.`,
            data: { isUSDUser: (user as any).isUSDUser },
        });
    } catch (error) {
        console.error('Error toggling USD user status:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while updating user status.',
            title: 'USD User Toggle',
        });
    }
};

/**
 * Fund USD Wallet (Admin)
 */
export const fundUSDWallet = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const adminId = res.locals.adminId;
        const { userId } = req.params;
        const { amountINR, description } = req.body;

        if (!amountINR || amountINR <= 0) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'Invalid amount.',
                title: 'Fund USD Wallet',
            });
        }

        const user = await models.User.findById(userId).select('isUSDUser name');
        if (!user) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 404,
                message: 'User not found.',
                title: 'Fund USD Wallet',
            });
        }

        if (!(user as any).isUSDUser) {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 400,
                message: 'User is not enabled for USD withdrawals.',
                title: 'Fund USD Wallet',
            });
        }

        const exchangeRate = await getExchangeRate();
        let usdWallet = await models.USDWallet.findOne({ userId });

        if (!usdWallet) {
            usdWallet = await models.USDWallet.create({
                userId,
                lastExchangeRate: exchangeRate,
            });
        }

        const amountUSD = convertINRtoUSD(amountINR, exchangeRate);

        (usdWallet as any).balanceINR += amountINR;
        (usdWallet as any).balanceUSD = convertINRtoUSD((usdWallet as any).balanceINR, exchangeRate);
        (usdWallet as any).totalFundedINR += amountINR;
        (usdWallet as any).lastExchangeRate = exchangeRate;
        await usdWallet.save();

        await models.USDWalletTransaction.create({
            userId,
            type: 'credit',
            amountINR,
            amountUSD,
            exchangeRate,
            description: description || 'Admin wallet funding',
            referenceType: 'admin_fund',
            balanceAfterINR: (usdWallet as any).balanceINR,
            balanceAfterUSD: (usdWallet as any).balanceUSD,
            processedBy: adminId,
        });

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Fund USD Wallet',
            message: `Successfully funded ₹${amountINR} to ${user.name}'s USD wallet.`,
            data: {
                wallet: {
                    balanceINR: (usdWallet as any).balanceINR,
                    balanceUSD: (usdWallet as any).balanceUSD,
                    totalFundedINR: (usdWallet as any).totalFundedINR,
                },
            },
        });
    } catch (error) {
        console.error('Error funding USD wallet:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while funding wallet.',
            title: 'Fund USD Wallet',
        });
    }
};

/**
 * Get All USD Withdrawals (Admin)
 */
export const getAllUSDWithdrawals = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const { page = 1, limit = 10, status, search, method } = req.query;

        const pageNum = Number.parseInt(page as string, 10);
        const limitNum = Number.parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const filter: any = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (method && method !== 'all') {
            filter.withdrawalMethod = method;
        }

        if (search) {
            const users = await models.User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');
            filter.userId = { $in: users.map((u) => u._id) };
        }

        const [withdrawals, totalCount] = await Promise.all([
            models.USDWithdrawal.find(filter)
                .populate('userId', 'name phone')
                .populate('processedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models.USDWithdrawal.countDocuments(filter),
        ]);

        const stats = await models.USDWithdrawal.aggregate([
            {
                $group: {
                    _id: { status: '$status' },
                    count: { $sum: 1 },
                    totalUSD: { $sum: '$amountUSD' },
                },
            },
        ]);

        const statistics = {
            pendingCount: stats.filter((s) => s._id.status === 'pending').reduce((acc, s) => acc + s.count, 0),
            completedAmountUSD: stats.filter((s) => s._id.status === 'completed').reduce((acc, s) => acc + s.totalUSD, 0),
            totalCount,
        };

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'USD Withdrawals',
            message: 'Withdrawals fetched successfully.',
            data: {
                withdrawals,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalCount,
                },
                statistics,
            },
        });
    } catch (error) {
        console.error('Error fetching USD withdrawals:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while fetching withdrawals.',
            title: 'USD Withdrawals',
        });
    }
};

/**
 * Approve USD Withdrawal (Admin)
 */
export const approveUSDWithdrawal = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const adminId = res.locals.adminId;
        const { withdrawalId } = req.params;
        const { remarks } = req.body;

        const withdrawal = await models.USDWithdrawal.findById(withdrawalId) as any;
        if (!withdrawal || withdrawal.status !== 'pending') {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 404,
                message: 'Withdrawal not found or already processed.',
                title: 'Approve USD Withdrawal',
            });
        }

        const usdWallet = await models.USDWallet.findOne({ userId: withdrawal.userId });
        const settings = await getWithdrawalSettings();
        const method = withdrawal.withdrawalMethod || settings.defaultWithdrawalMethod;

        if (method === 'stripe') {
            try {
                const amountCents = stripeService.usdToCents(withdrawal.amountUSD);
                const transfer = await stripeService.createTransfer(
                    amountCents,
                    (usdWallet as any).stripeConnectAccountId as string,
                    {
                        withdrawalId: withdrawal._id.toString(),
                        userId: withdrawal.userId.toString()
                    }
                );

                withdrawal.status = 'completed';
                withdrawal.stripeTransferId = transfer.id;
                withdrawal.adminRemarks = remarks || 'Processed via Stripe';
                withdrawal.processedAt = new Date();
                withdrawal.processedBy = adminId;
                await withdrawal.save();

                if (usdWallet) {
                    (usdWallet as any).totalWithdrawnUSD += withdrawal.amountUSD;
                    await usdWallet.save();
                }

                return JsonResponse(res, {
                    status: 'success',
                    statusCode: 200,
                    title: 'Approve USD Withdrawal',
                    message: 'Withdrawal approved and processed via Stripe.',
                });
            } catch (err: any) {
                return await handleWithdrawalFailure(res, withdrawal, usdWallet, adminId, err, 'Stripe');
            }
        } else if (method === 'bitget') {
            try {
                const { bitget } = await getBitgetServiceWithSettings();
                const chain = bitget.mapNetworkToBitgetChain((withdrawal as any).bitgetNetwork || settings.bitgetNetwork);

                const feePercent = settings.bitgetFeePercent || 0.1;
                const netAmount = withdrawal.amountUSD - (withdrawal.amountUSD * feePercent / 100);

                const result = await bitget.withdraw({
                    coin: (withdrawal as any).bitgetCurrency || settings.bitgetCurrency,
                    chain,
                    address: withdrawal.bitgetWalletAddress,
                    amount: netAmount,
                    clientOid: withdrawal._id.toString(),
                });

                withdrawal.status = 'completed';
                withdrawal.bitgetWithdrawId = result.orderId;
                withdrawal.adminRemarks = remarks || 'Processed via Bitget';
                withdrawal.processedAt = new Date();
                withdrawal.processedBy = adminId;
                await withdrawal.save();

                if (usdWallet) {
                    (usdWallet as any).totalWithdrawnUSD += withdrawal.amountUSD;
                    await usdWallet.save();
                }

                return JsonResponse(res, {
                    status: 'success',
                    statusCode: 200,
                    title: 'Approve USD Withdrawal',
                    message: 'Withdrawal approved and processed via Bitget.',
                });
            } catch (err: any) {
                return await handleWithdrawalFailure(res, withdrawal, usdWallet, adminId, err, 'Bitget');
            }
        }

        return JsonResponse(res, {
            status: 'error',
            statusCode: 400,
            message: 'Invalid withdrawal method.',
            title: 'Approve USD Withdrawal',
        });
    } catch (error) {
        console.error('Error approving USD withdrawal:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while approving withdrawal.',
            title: 'Approve USD Withdrawal',
        });
    }
};

const handleWithdrawalFailure = async (res: Response, withdrawal: any, usdWallet: any, adminId: string, error: any, provider: string) => {
    withdrawal.status = 'failed';
    withdrawal.adminRemarks = `${provider} error: ${error.message || 'Unknown error'}`;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = adminId;
    await withdrawal.save();

    if (usdWallet) {
        (usdWallet as any).balanceINR += withdrawal.amountINR;
        (usdWallet as any).balanceUSD = convertINRtoUSD((usdWallet as any).balanceINR, withdrawal.exchangeRate);
        await usdWallet.save();
    }

    return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: `${provider} transfer failed. Amount refunded to wallet.`,
        title: 'Approve USD Withdrawal',
    });
};

/**
 * Reject USD Withdrawal (Admin)
 */
export const rejectUSDWithdrawal = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const adminId = res.locals.adminId;
        const { withdrawalId } = req.params;
        const { reason } = req.body;

        const withdrawal = await models.USDWithdrawal.findById(withdrawalId) as any;
        if (!withdrawal || withdrawal.status !== 'pending') {
            return JsonResponse(res, {
                status: 'error',
                statusCode: 404,
                message: 'Withdrawal not found or already processed.',
                title: 'Reject USD Withdrawal',
            });
        }

        const usdWallet = await models.USDWallet.findOne({ userId: withdrawal.userId });
        if (usdWallet) {
            (usdWallet as any).balanceINR += withdrawal.amountINR;
            (usdWallet as any).balanceUSD = convertINRtoUSD((usdWallet as any).balanceINR, withdrawal.exchangeRate);
            await usdWallet.save();
        }

        withdrawal.status = 'rejected';
        withdrawal.rejectionReason = reason;
        withdrawal.processedAt = new Date();
        withdrawal.processedBy = adminId;
        await withdrawal.save();

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Reject USD Withdrawal',
            message: 'Withdrawal rejected and amount refunded to wallet.',
        });
    } catch (error) {
        console.error('Error rejecting USD withdrawal:', error);
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            message: 'An error occurred while rejecting withdrawal.',
            title: 'Reject USD Withdrawal',
        });
    }
};

/**
 * Get USD Wallet Details for a User (Admin)
 */
export const getUSDWalletByUserId = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await models.User.findById(userId).select('isUSDUser name phone');
        const usdWallet = await models.USDWallet.findOne({ userId });

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'USD Wallet Details',
            message: 'Wallet details retrieved successfully.',
            data: { user, wallet: usdWallet },
        });
    } catch (error) {
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            title: 'USD Wallet Details',
            message: 'Error fetching wallet'
        });
    }
};

/**
 * Check Bitget Withdrawal Status (Admin)
 */
export const checkBitgetWithdrawalStatus = async (
    req: Request,
    res: Response,
    __: NextFunction
) => {
    try {
        const { withdrawalId } = req.params;
        const withdrawal = await models.USDWithdrawal.findById(withdrawalId) as any;
        if (!withdrawal?.bitgetWithdrawId) return JsonResponse(res, {
            status: 'error',
            statusCode: 400,
            title: 'Bitget Status',
            message: 'Not a bitget withdrawal'
        });

        const { bitget } = await getBitgetServiceWithSettings();
        const status = await bitget.getWithdrawStatus(withdrawal.bitgetWithdrawId);

        if (status?.txId) {
            withdrawal.bitgetTxHash = status.txId;
            await withdrawal.save();
        }

        return JsonResponse(res, {
            status: 'success',
            statusCode: 200,
            title: 'Bitget Status',
            message: 'Bitget status retrieved.',
            data: status
        });
    } catch (error) {
        return JsonResponse(res, {
            status: 'error',
            statusCode: 500,
            title: 'Bitget Status',
            message: 'Error checking status'
        });
    }
};

export default {
    
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
};
