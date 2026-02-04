  import React, { useState } from "react";
  import {
    Text,
    Button,
    Modal,
    Card,
    Badge,
    Loader,
    Group,
    Divider,
    Alert,
    Center,
    Tabs,
    NumberInput,
    Stack,
    Paper,
    Title,
    ThemeIcon,
    Pagination,
    TextInput,
    Select,
    ActionIcon,
    Tooltip,
  } from "@mantine/core";
  import {
    useUSDWalletInfo,
    useStripeConnectStatus,
    useUSDWithdrawalHistory,
    useUSDTransactionHistory,
    useWithdrawalMethods,
    useSaveBitgetWallet,
    useCreateUSDWithdrawalWithMethod,
  } from "../../hooks/query/useUSDWithdrawal.query";
  import {
    useCheckWithdrawalAvailability,
    useWithdrawalSchedule,
  } from "../../hooks/query/useWithdrawal.query";
  import classes from "./USDWithdrawalScreen.module.scss";
  import {
    FaDollarSign,
    FaWallet,
    FaClock,
    FaExchangeAlt,
    FaHistory,
    FaInfoCircle,
    FaBan,
    FaPlus,
    FaMinus,
    FaRegQuestionCircle,
    FaCalendarAlt,
  } from "react-icons/fa";
  import { RiExchangeFundsLine } from "react-icons/ri";
  import { notifications } from "@mantine/notifications";

  const USDWithdrawalScreen: React.FC = () => {
    const [withdrawalModal, setWithdrawalModal] = useState(false);
    const [bitgetWalletModal, setBitgetWalletModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<number | "">(0);
    const [historyPage, setHistoryPage] = useState(1);
    const [transactionPage, setTransactionPage] = useState(1);
    const [bitgetAddress, setBitgetAddress] = useState("");
    const [bitgetNetwork, setBitgetNetwork] = useState("trc20");
    const [selectedMethod] = useState<string>("bitget");

    
    const { data: walletData, isLoading: walletLoading } = useUSDWalletInfo();
    const { data: connectStatus, isLoading: connectLoading } = useStripeConnectStatus();
    const { data: withdrawalHistory, isLoading: historyLoading } = useUSDWithdrawalHistory(historyPage, 10);
    const { data: transactionHistory, isLoading: transactionLoading } = useUSDTransactionHistory(transactionPage, 10);
    const { data: methodsData } = useWithdrawalMethods();
    const { data: availabilityData } = useCheckWithdrawalAvailability();
    useWithdrawalSchedule();

    const createWithdrawalMutation = useCreateUSDWithdrawalWithMethod();
    const saveBitgetWalletMutation = useSaveBitgetWallet();

    const predefinedAmounts = [1, 10, 100, 500, 1000, 5000];

    const bitgetMinimums: Record<string, number> = {
      'trc20': 10,
      'bep20': 10,
      'erc20': 10,
      'polygon': 10,
      'arbitrumone': 10,
      'arbitrum': 10,
      'optimism': 10,
      'sol': 10,
      'ton': 10,
      'aptos': 10,
      'avaxc-chain': 10,
      'morph': 10,
    };

    const wallet = walletData?.wallet;
    const exchangeRate = walletData?.currentExchangeRate || 83;
    const isOnboarded = connectStatus?.isOnboarded || false;

    
    const bitgetEnabled = methodsData?.methods?.bitget?.enabled !== false;
    const bitgetSettings = methodsData?.methods?.bitget || {};

    
    const hasBitgetWallet = wallet?.bitgetWalletAddress && wallet?.bitgetVerified;

    const canWithdraw = availabilityData?.canWithdraw;
    const availabilityReason = availabilityData?.reason;

    const handleSaveBitgetWallet = () => {
      if (!bitgetAddress.trim()) {
        notifications.show({
          title: "Error",
          message: "Please enter a valid wallet address",
          color: "red",
        });
        return;
      }

      saveBitgetWalletMutation.mutate(
        { bitgetWalletAddress: bitgetAddress, bitgetNetwork },
        {
          onSuccess: () => {
            setBitgetWalletModal(false);
            setBitgetAddress("");
          },
        }
      );
    };

    const handleWithdraw = () => {
      if (!canWithdraw) {
        notifications.show({
          title: "Withdrawals Restricted",
          message: availabilityReason || "Withdrawals are currently not available.",
          color: "orange",
        });
        return;
      }

      if (!withdrawAmount || withdrawAmount <= 0) {
        notifications.show({
          title: "Error",
          message: "Please enter a valid amount",
          color: "red",
        });
        return;
      }

      if (!wallet || withdrawAmount > wallet.balanceINR) {
        notifications.show({
          title: "Error",
          message: "Insufficient balance",
          color: "red",
        });
        return;
      }

      if (selectedMethod === "bitget" && !hasBitgetWallet) {
        notifications.show({
          title: "Error",
          message: "Please add your Bitget wallet address first",
          color: "red",
        });
        return;
      }

      if (selectedMethod === "stripe" && !isOnboarded) {
        notifications.show({
          title: "Error",
          message: "Please complete Stripe verification first",
          color: "red",
        });
        return;
      }

      if (selectedMethod === "bitget") {
        const network = wallet?.bitgetNetwork || 'trc20';
        const minUSD = bitgetMinimums[network.toLowerCase()] || 10;
        const amountUSD = Number(withdrawAmount) / exchangeRate;

        if (amountUSD < minUSD) {
          notifications.show({
            title: "Minimum Not Met",
            message: `Bitget requires minimum $${minUSD} USDT. Current: $${amountUSD.toFixed(2)}`,
            color: "red",
          });
          return;
        }
      }

      createWithdrawalMutation.mutate(
        { amountINR: Number(withdrawAmount), withdrawalMethod: selectedMethod as 'stripe' | 'bitget' },
        {
          onSuccess: () => {
            setWithdrawalModal(false);
            setWithdrawAmount(0);
          },
        }
      );
    };

    const getStatusTag = (status: string) => {
      const className = classes[`status${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`] || '';
      return <span className={`${classes.statusTag} ${className}`}>{status}</span>;
    };

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    if (walletLoading || connectLoading) {
      return (
        <div className={classes.loadingContainer}>
          <Loader size="lg" color="indigo" />
        </div>
      );
    }

if (!wallet && !walletLoading) {
  return (
    <div className={classes.container}>
      <Title order={2} className={classes.title}>
        Institutional Treasury
      </Title>
      <Card
        className={classes.card}
        p="xl"
        withBorder
        radius="24px"
        style={{
          textAlign: "center",
          background: "linear-gradient(145deg, #f9fafb, #ffffff)",
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon
            size={80}
            radius="xl"
            color="gray"
            variant="light"
            style={{
              backgroundColor: "#f3f4f6",
              border: "1px dashed #d1d5db",
            }}
          >
            <FaBan size={40} />
          </ThemeIcon>

          <Text size="xl" fw={700} ta="center" c="dark">
            USD Access Unavailable
          </Text>

          <Text size="sm" c="dimmed" ta="center" maw={420}>
            Your institutional account has not been onboarded for USD Treasury operations yet.
            Please contact your manager or the finance administrator to enable USD Liquidations.
          </Text>

          <Button
            mt="md"
            radius="md"
            color="indigo"
            variant="light"
            onClick={() => window.open("mailto:support@yourcompany.com", "_blank")}
          >
            Contact Administrator
          </Button>
        </Stack>
      </Card>
    </div>
  );
}

    return (
      <div className={classes.container}>
        <Group justify="space-between" align="center" mb="xl">
          <Title order={2} className={classes.title}>
            Institutional Treasury
          </Title>
          <Tooltip label="Withdrawal Schedule">
            <ActionIcon variant="light" color="indigo" size="lg" radius="md">
              <FaCalendarAlt />
            </ActionIcon>
          </Tooltip>
        </Group>

        {}
        <div className={classes.walletCard}>
          <div className={classes.walletHeader}>
            <Text className={classes.walletTitle}>
              Global Liquidity Node
            </Text>
            <Group gap="xs">
              {bitgetEnabled && hasBitgetWallet && (
                <Badge color="teal" variant="filled" size="sm">
                  Bitget Node Active
                </Badge>
              )}
            </Group>
          </div>

          <div className={classes.balanceSection}>
            <div className={classes.balanceItem}>
              <Text className={classes.balanceLabel}>
                <FaWallet size={12} /> Local Holding (INR)
              </Text>
              <Text className={`${classes.balanceValue} ${classes.inrBalance}`}>
                ₹{wallet?.balanceINR?.toLocaleString() || 0}
              </Text>
            </div>
            <div className={classes.balanceItem}>
              <Text className={classes.balanceLabel}>
                <FaDollarSign size={12} /> USD Appraisal
              </Text>
              <Text className={`${classes.balanceValue} ${classes.usdBalance}`}>
                ${wallet?.balanceUSD?.toFixed(2) || "0.00"}
              </Text>
            </div>
          </div>

          <Text className={classes.exchangeRate}>
            Liquidity Provider Rate: 1.00 USD @ ₹{exchangeRate}
          </Text>
        </div>

        {}
        {!canWithdraw && (
          <div className={classes.availabilityAlert}>
            <FaInfoCircle className={classes.alertIcon} />
            <div className={classes.alertContent}>
              <Text className={classes.alertTitle}>Treasury Liquidation Closed</Text>
              <Text className={classes.alertMessage}>
                {availabilityReason || "Withdrawals are currently processed during business hours only."}
                {" "}Check the schedule for next availability.
              </Text>
            </div>
          </div>
        )}

        {}
        {bitgetEnabled && hasBitgetWallet && (
          <Card className={classes.card} p="lg" mb="xl">
            <Group justify="space-between">
              <Group>
                <div className={classes.methodIcon} style={{ background: '#ecfdf5', color: '#059669' }}>
                  <RiExchangeFundsLine size={24} />
                </div>
                <div>
                  <Text fw={700} size="sm">Bitget Node Connected</Text>
                  <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                    {wallet.bitgetWalletAddress.slice(0, 12)}...{wallet.bitgetWalletAddress.slice(-12)}
                  </Text>
                </div>
              </Group>
              <Button variant="subtle" color="gray" size="xs" onClick={() => setBitgetWalletModal(true)}>
                Modify Node
              </Button>
            </Group>
          </Card>
        )}
        {bitgetEnabled && !hasBitgetWallet && (
          <div className={classes.onboardingCard}>
            <div className={classes.methodIcon} style={{ background: '#f5f3ff', color: '#6366f1', margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>
              <RiExchangeFundsLine size={32} />
            </div>
            <Text className={classes.onboardingTitle}>Setup Crypto Liquidation</Text>
            <Text className={classes.onboardingDesc}>
              Connect your {bitgetSettings?.network || "TRC20"} wallet to receive instant {bitgetSettings?.currency} settlements.
            </Text>
            <Button
              className={classes.stripeBtn}
              onClick={() => setBitgetWalletModal(true)}
              leftSection={<PlusIcon />}
            >
              Add Wallet Node
            </Button>
          </div>
        )}

        {}
        <Card className={classes.card} p="xl" mb="xl">
          <Stack gap="xl">
            <div>
              <Text fw={700} size="lg" mb="xs">Market Liquidation</Text>
              <Text size="sm" c="dimmed">Select liquidation amount to initiate global settlement.</Text>
            </div>

            <div className={classes.amountGrid}>
              {predefinedAmounts.map((amount) => {
                const isDisabled = amount > (wallet?.balanceINR || 0);
                const isSelected = withdrawAmount === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    disabled={isDisabled}
                    className={`${classes.amountCard} ${isSelected ? classes.amountSelected : ""} ${isDisabled ? classes.amountDisabled : ""}`}
                    onClick={() => setWithdrawAmount(amount)}
                  >
                    <Text size="sm" fw={700}>₹{amount.toLocaleString()}</Text>
                    <Text size="xs" style={{ opacity: isSelected ? 0.8 : 0.6 }}>
                      ~${(amount / exchangeRate).toFixed(1)}
                    </Text>
                  </button>
                );
              })}
            </div>

            <NumberInput
              label="Custom Liquidation Amount (INR)"
              placeholder="Min liquidation: ₹1.00"
              value={withdrawAmount}
              onChange={(val) => setWithdrawAmount(val as number)}
              size="lg"
              radius="md"
              prefix="₹ "
              max={wallet?.balanceINR || 0}
              error={withdrawAmount && Number(withdrawAmount) > (wallet?.balanceINR || 0) ? "Insufficient Treasury Balance" : null}
            />

            <Button
              className={classes.withdrawBtn}
              onClick={() => setWithdrawalModal(true)}
              disabled={!withdrawAmount || Number(withdrawAmount) < 1 || !canWithdraw}
              leftSection={<FaExchangeAlt />}
              fullWidth
            >
              Initiate Liquidation
            </Button>
          </Stack>
        </Card>

        {}
        <Card className={classes.card} p={0}>
          <Tabs defaultValue="history" variant="outline" styles={{
            tab: { padding: '1.25rem 1.5rem', fontWeight: 600 },
            panel: { padding: '0' }
          }}>
            <Tabs.List>
              <Tabs.Tab value="history" leftSection={<FaHistory />}>Activity Logs</Tabs.Tab>
              <Tabs.Tab value="transactions" leftSection={<FaWallet />}>Ledger Details</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="history">
              {historyLoading && <Center p="xl"><Loader variant="dots" /></Center>}
              {!historyLoading && withdrawalHistory?.withdrawals?.length > 0 && (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {withdrawalHistory.withdrawals.map((item: { _id: string; amountINR: number; amountUSD: number; status: string; withdrawalMethod: string; createdAt: string; exchangeRate: number }) => (
                      <div key={item._id} className={classes.historyItem}>
                        <Group justify="space-between" mb="xs">
                          <Text fw={700}>₹{item.amountINR.toLocaleString()} → ${item.amountUSD.toFixed(2)}</Text>
                          {getStatusTag(item.status)}
                        </Group>
                        <Group justify="space-between" align="flex-end">
                          <Group gap="md">
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              <FaRegQuestionCircle style={{ marginRight: 4 }} />
                              {item.withdrawalMethod === 'bitget' ? 'Blockchain Settlement' : 'Bank Wire'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              <FaClock style={{ marginRight: 4 }} />
                              {formatDate(item.createdAt)}
                            </div>
                          </Group>
                          <Text size="xs" c="dimmed">Rate: ₹{item.exchangeRate}</Text>
                        </Group>
                      </div>
                    ))}
                    {withdrawalHistory.totalPages > 1 && (
                      <Center py="md">
                        <Pagination value={historyPage} onChange={setHistoryPage} total={withdrawalHistory.totalPages} radius="md" />
                      </Center>
                    )}
                  </div>
              )}
              {!historyLoading && (!withdrawalHistory?.withdrawals || withdrawalHistory.withdrawals.length === 0) && (
                  <Center p="xl"><Stack align="center" gap="xs"><FaHistory size={32} color="#e2e8f0" /><Text c="dimmed" size="sm">No activity recorded</Text></Stack></Center>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="transactions">
              {transactionLoading && <Center p="xl"><Loader variant="dots" /></Center>}
              {!transactionLoading && transactionHistory?.transactions?.length > 0 && (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {transactionHistory.transactions.map((item: { _id: string; type: string; amountINR: number; amountUSD: number; createdAt: string }) => (
                      <div key={item._id} className={classes.historyItem}>
                        <Group justify="space-between">
                          <Group>
                            <ActionIcon variant="light" color={item.type.includes('credit') || item.type === 'admin_fund' ? 'green' : 'red'}>
                              {item.type.includes('credit') || item.type === 'admin_fund' ? <FaPlus size={12} /> : <FaMinus size={12} />}
                            </ActionIcon>
                            <div>
                              <Text fw={600} size="sm" tt="capitalize">{item.type.replace('_', ' ')}</Text>
                              <Text size="xs" c="dimmed">{formatDate(item.createdAt)}</Text>
                            </div>
                          </Group>
                          <div style={{ textAlign: 'right' }}>
                            <Text fw={700} c={item.type.includes('credit') || item.type === 'admin_fund' ? 'green' : 'red'}>
                              {item.type.includes('credit') || item.type === 'admin_fund' ? '+' : '-'}₹{Math.abs(item.amountINR).toLocaleString()}
                            </Text>
                            <Text size="xs" c="dimmed">${Math.abs(item.amountUSD).toFixed(2)}</Text>
                          </div>
                        </Group>
                      </div>
                    ))}
                    {transactionHistory.totalPages > 1 && (
                      <Center py="md">
                        <Pagination value={transactionPage} onChange={setTransactionPage} total={transactionHistory.totalPages} radius="md" />
                      </Center>
                    )}
                  </div>
              )}
              {!transactionLoading && (!transactionHistory?.transactions || transactionHistory.transactions.length === 0) && (
                  <Center p="xl"><Stack align="center" gap="xs"><FaWallet size={32} color="#e2e8f0" /><Text c="dimmed" size="sm">No ledger entries</Text></Stack></Center>
              )}
            </Tabs.Panel>
          </Tabs>
        </Card>

        {}
        <Modal
          opened={withdrawalModal}
          onClose={() => setWithdrawalModal(false)}
          title="Institutional Liquidation Confirmation"
          centered
          radius="24px"
          padding="xl"
        >
          <Stack gap="lg">
            <Alert color="indigo" variant="light" radius="md">
              Liquidation via <b>{(selectedMethod || 'Bitget').toUpperCase()}</b>.
              Funds will be dispatched to your linked institutional node.
            </Alert>

            <Paper withBorder p="md" radius="md" bg="#f8fafc">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Liquidation Amount</Text>
                  <Text fw={700}>₹{Number(withdrawAmount).toLocaleString()}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Provider Rate</Text>
                  <Text fw={700}>₹{exchangeRate}</Text>
                </Group>
                <Divider my="xs" />
                <Group justify="space-between">
                  <Text fw={700}>Total Net Disbursement</Text>
                  <Text fw={800} size="lg" c="indigo">
                    ${(Number(withdrawAmount) / exchangeRate).toFixed(2)} USDT
                  </Text>
                </Group>
              </Stack>
            </Paper>

            <Button
              size="lg"
              radius="md"
              className={classes.withdrawBtn}
              onClick={handleWithdraw}
              loading={createWithdrawalMutation.isPending}
              fullWidth
            >
              Confirm Disbursement
            </Button>
          </Stack>
        </Modal>

        {}
        <Modal
          opened={bitgetWalletModal}
          onClose={() => setBitgetWalletModal(false)}
          title="Node Configuration"
          centered
          radius="24px"
        >
          <Stack gap="md">
            <Select
              label="Blockchain Network"
              placeholder="Select protocol"
              value={bitgetNetwork}
              onChange={(val) => setBitgetNetwork(val || "trc20")}
              data={[
                { value: "trc20", label: "Tron (TRC20) - Zero Settlement Fee" },
                { value: "bep20", label: "BNB Smart Chain (BEP20)" },
                { value: "erc20", label: "Ethereum (ERC20)" },
              ]}
            />
            <TextInput
              label="Wallet Endpoint Address"
              placeholder="Enter public key"
              value={bitgetAddress}
              onChange={(e) => setBitgetAddress(e.target.value)}
            />
            <Button
              className={classes.stripeBtn}
              onClick={handleSaveBitgetWallet}
              loading={saveBitgetWalletMutation.isPending}
              fullWidth
            >
              Update Node
            </Button>
          </Stack>
        </Modal>
      </div>
    );
  };

  const PlusIcon = () => <FaPlus size={14} />;

  export default USDWithdrawalScreen;
