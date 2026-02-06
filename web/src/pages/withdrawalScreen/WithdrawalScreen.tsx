import React, { useMemo, useEffect, useState } from "react";
import {
  Flex,
  Text,
  Button,
  Modal,
  TextInput,
  PasswordInput,
  Paper,
  Divider,
  Loader,
  Center,
  Tabs,
  Image,
  Box,
  Container,
  Stack,
  ThemeIcon,
  FileInput,
  Badge,
  Alert,
  Radio,
  Group,
  ActionIcon,
  Select,
  Card,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  useWalletInfoQuery,
  useBankAccountsQuery,
  useAddBankAccountMutation,
  useAddQRCodeMutation,
  useDeleteBankAccountMutation,
  useSetDefaultAccountMutation,
  useCreateWithdrawalMutation,
  useWithdrawalSchedule,
} from "../../hooks/query/useWithdrawal.query";
import {
  FaWallet,
  FaPlus,
  FaUniversity,
  FaQrcode,
  FaRegTrashAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaInfoCircle,
  FaImage,
  FaLock,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../../store/store";
import classes from "./WithdrawalScreen.module.scss";

const WithdrawalScreen: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState("mainWallet");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("bank");

  const isUSDUser =
    useSelector((state: RootState) => state.auth?.userData?.isUSDUser) || false;

  const [addAccountOpened, { open: openAddAccount, close: closeAddAccount }] =
    useDisclosure(false);

  const [accountForm, setAccountForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "savings",
  });

  const [qrForm, setQrForm] = useState({
    qrName: "",
    upiId: "",
    qrImage: null as File | null,
    qrPreview: "" as string,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const predefinedAmounts = [
    290, 1020, 1580, 6500 ,16000, 35000, 5500
  ];

  const { data: walletInfo, isLoading: walletLoading } = useWalletInfoQuery();
  const { data: bankData = [], isLoading: bankLoading, refetch: refetchBankAccounts } = useBankAccountsQuery();
  const { data: scheduleData, isLoading: scheduleLoading } =
    useWithdrawalSchedule();

  const bankAccounts = Array.isArray(bankData) ? bankData : bankData?.accounts ?? [];
  const addBankMutation = useAddBankAccountMutation();
  const addQRMutation = useAddQRCodeMutation();
  const deleteBankMutation = useDeleteBankAccountMutation();
  const setDefaultMutation = useSetDefaultAccountMutation();
  const createWithdrawalMutation = useCreateWithdrawalMutation();

  const schedule = scheduleData?.schedule || [];
  const userLevel = scheduleData?.userLevel;
  const todaySchedule = scheduleData?.today;

  const timeToMinutes = (timeString: string) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isTimeAllowed = useMemo(() => {
    if (!todaySchedule?.startTime || !todaySchedule?.endTime) return false;
    const start = timeToMinutes(todaySchedule.startTime);
    const end = timeToMinutes(todaySchedule.endTime);
    return currentTimeMinutes >= start && currentTimeMinutes <= end;
  }, [todaySchedule, currentTimeMinutes]);

  const isTodayAllowed =
    todaySchedule?.isActive &&
    Array.isArray(todaySchedule?.allowedLevels) &&
    todaySchedule.allowedLevels.includes(userLevel);

  useEffect(() => {
    if (bankAccounts.length > 0) {
      const defaultAcc = bankAccounts.find((a: any) => a.isDefault);
      if (defaultAcc) setSelectedAccount(defaultAcc._id);
      else setSelectedAccount(bankAccounts[0]._id);
    }
  }, [bankAccounts]);

  // ---- FORM VALIDATION ----
  const validateBankForm = () => {
    const errors: Record<string, string> = {};
    if (!accountForm.accountHolderName.trim())
      errors.accountHolderName = "Account holder name is required";
    else if (accountForm.accountHolderName.length < 3)
      errors.accountHolderName = "Name must be at least 3 characters";
    if (!accountForm.bankName.trim())
      errors.bankName = "Bank name is required";
    if (!accountForm.accountNumber.trim())
      errors.accountNumber = "Account number is required";
    else if (!/^\d{9,18}$/.test(accountForm.accountNumber))
      errors.accountNumber = "Invalid account number (9-18 digits)";
    if (!accountForm.confirmAccountNumber)
      errors.confirmAccountNumber = "Please confirm account number";
    else if (accountForm.accountNumber !== accountForm.confirmAccountNumber)
      errors.confirmAccountNumber = "Account numbers do not match";
    if (!accountForm.ifscCode.trim())
      errors.ifscCode = "IFSC code is required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(accountForm.ifscCode.toUpperCase()))
      errors.ifscCode = "Invalid IFSC code format";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateQRForm = () => {
    const errors: Record<string, string> = {};
    if (!qrForm.qrName.trim()) errors.qrName = "QR name is required";
    if (!qrForm.qrImage) errors.qrImage = "QR code image is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- ACCOUNT HANDLERS ----
  const handleAddBankAccount = () => {
    if (!validateBankForm()) return;
    if (bankAccounts.length >= 4) return;
    const payload = {
      accountHolderName: accountForm.accountHolderName.trim(),
      bankName: accountForm.bankName.trim(),
      accountNumber: accountForm.accountNumber.trim(),
      ifscCode: accountForm.ifscCode.toUpperCase().trim(),
      branchName: accountForm.branchName.trim(),
      accountType: accountForm.accountType,
      isDefault: bankAccounts.length === 0,
    };
    addBankMutation.mutate(payload, {
      onSuccess: () => {
        closeAddAccount();
        setAccountForm({
          accountHolderName: "",
          bankName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          branchName: "",
          accountType: "savings",
        });
        setFormErrors({});
        try {
          refetchBankAccounts();
        } catch (e) {
          console.log(e)
        }
      },
    });
  };

  const handleAddQRCode = () => {
    if (!validateQRForm()) return;
    if (bankAccounts.filter((a: any) => a.accountType === "qr").length >= 4)
      return;
    const formData = new FormData();
    formData.append("qrName", qrForm.qrName.trim());
    formData.append("upiId", qrForm.upiId.trim());
    formData.append("qrCodeImage", qrForm.qrImage!);
    formData.append("isDefault", String(bankAccounts.length === 0));
    addQRMutation.mutate(formData, {
      onSuccess: () => {
        closeAddAccount();
        setQrForm({ qrName: "", upiId: "", qrImage: null, qrPreview: "" });
        setFormErrors({});
        try {
          refetchBankAccounts();
        } catch (e) {
          console.log(e)
        }
      },
    });
  };

  const handleQRImageChange = (file: File | null) => {
    if (file) {
      setQrForm({ ...qrForm, qrImage: file });
      const reader = new FileReader();
      reader.onloadend = () =>
        setQrForm((prev) => ({ ...prev, qrPreview: reader.result as string }));
      reader.readAsDataURL(file);
    } else setQrForm({ ...qrForm, qrImage: null, qrPreview: "" });
  };

  const handleDeleteAccount = (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this account?"))
      deleteBankMutation.mutate(accountId);
  };

  const handleSetDefault = (accountId: string) => {
    setDefaultMutation.mutate(accountId);
  };

  const handleWithdrawal = () => {
    const amount = selectedAmount;
    if (!amount || amount < 280 || !withdrawalPassword) return;
    if (!isUSDUser && !selectedAccount) return;
    const selectedWalletBalance =
      selectedWallet === "mainWallet"
        ? walletInfo?.mainWallet
        : walletInfo?.commissionWallet;
    if (amount > selectedWalletBalance) {
      notifications.show({
        title: "Error",
        message: "Insufficient balance",
        color: "red",
      });
      return;
    }
    createWithdrawalMutation.mutate(
      {
        walletType: selectedWallet,
        amount,
        bankAccountId: isUSDUser ? undefined : selectedAccount,
        withdrawalPassword,
      },
      {
        onSuccess: () => {
          setSelectedAmount(null);
          setWithdrawalPassword("");
        },
      }
    );
  };

  const getSelectedWalletBalance = () =>
    selectedWallet === "mainWallet"
      ? walletInfo?.mainWallet || 0
      : walletInfo?.commissionWallet || 0;

  if (walletLoading || bankLoading || scheduleLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="#0f172a" />
      </Center>
    );
  }

  return (
    <div className={classes.withdrawalScreen}>
      <div className={classes.headerBanner}>
        <div className={classes.container}>
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Title order={2} style={{ color: "#fff" }}>
                Institutional Disbursal
              </Title>
              <Text size="xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                Capital Liquidation Node
              </Text>
            </Stack>
            <ThemeIcon
              variant="light"
              color="rgba(255,255,255,0.1)"
              size={48}
              radius="xl"
            >
              <FaWallet size={20} color="#fff" />
            </ThemeIcon>
          </Group>
        </div>
      </div>

      <Container className={classes.container} size="sm">
        <Stack gap="lg">
          {/* ---- Alerts ---- */}
          {!isTodayAllowed && (
            <Alert
              icon={<FaLock />}
              color="red"
              variant="light"
              className={classes.alert}
              title="Withdrawals Not Available Today"
            >
              <Text size="sm">
                Your level {userLevel} is not allowed to withdraw today.
                Please check the schedule below for your next available day.
              </Text>
            </Alert>
          )}

          {isTodayAllowed && todaySchedule && !isTimeAllowed && (
            <Alert
              icon={<FaLock />}
              color="orange"
              variant="light"
              className={classes.alert}
              title="Withdrawal Window Closed"
            >
              <Text size="sm">
                Withdrawals open today between{" "}
                <strong>
                  {todaySchedule.startTime} - {todaySchedule.endTime}
                </strong>
                .
              </Text>
            </Alert>
          )}

          {isTodayAllowed && todaySchedule && isTimeAllowed && (
            <Alert
              icon={<FaCalendarAlt />}
              color="green"
              variant="light"
              className={classes.alert}
              title="Withdrawal Window Open"
            >
              <Text size="sm">
                You can withdraw now. Window closes at{" "}
                <strong>{todaySchedule.endTime}</strong>.
              </Text>
            </Alert>
          )}

          {/* ---- Balance Card ---- */}
          <Paper className={classes.balanceCard}>
            <Stack gap="lg">
              <Box>
                <Text size="xs" c="dimmed" fw={800} style={{ letterSpacing: 1.2 }}>
                  TOTAL OPERATIONAL BALANCE
                </Text>
                <Flex align="center" justify="space-between" mt={4}>
                  <Text size="38px" fw={900} c="#0f172a" ff="Montserrat">
                    ₹{walletInfo?.mainWallet?.toLocaleString() || "0"}
                  </Text>
                  <ThemeIcon variant="light" color="indigo" size="xl" radius="lg">
                    <FaShieldAlt size={24} />
                  </ThemeIcon>
                </Flex>
              </Box>

              <Divider color="gray.1" />

              <Flex justify="space-between" align="center">
                <Box>
                  <Text size="10px" c="dimmed" fw={800}>
                    MINIMUM LIQUIDATION
                  </Text>
                  <Text fw={800} size="sm">
                    ₹280.00
                  </Text>
                </Box>
                <Box ta="right">
                  <Text size="10px" c="dimmed" fw={800}>
                    SETTLEMENT SLA
                  </Text>
                  <Text fw={800} size="sm">
                    24-48 Business Hours
                  </Text>
                </Box>
              </Flex>
            </Stack>
          </Paper>

          {/* ---- Withdrawal Section ---- */}
          {isTodayAllowed && isTimeAllowed && (
            <Stack gap="lg">
              {isUSDUser && (
                <Alert
                  icon={<FaDollarSign />}
                  color="indigo"
                  variant="light"
                  className={classes.alert}
                  title="Global Treasury Sync"
                >
                  <Text size="sm" mb="xs">
                    Institutional accounts are settled via the{" "}
                    <strong>USD Ledger</strong>. Your INR disbursal will be
                    appraised at the daily market rate.
                  </Text>
                  <Button
                    component={Link}
                    to="/usd-withdrawal"
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<FaWallet size={12} />}
                    mt="xs"
                  >
                    Manage USD Node
                  </Button>
                </Alert>
              )}

              {/* Wallet Selection */}
              <Card className={classes.card} p="xl">
                <Text fw={700} size="sm" mb="md" c="dimmed">
                  1. SELECT SOURCE LEDGER
                </Text>
                <Radio.Group
                  value={selectedWallet}
                  onChange={(v) => {
                    setSelectedWallet(v);
                    setSelectedAmount(null);
                  }}
                >
                  <Stack gap="sm">
                    <Paper
                      withBorder
                      p="md"
                      radius="md"
                      className={
                        selectedWallet === "mainWallet" ? classes.activeCard : ""
                      }
                      onClick={() => setSelectedWallet("mainWallet")}
                      style={{ cursor: "pointer" }}
                    >
                      <Group justify="space-between">
                        <Radio
                          value="mainWallet"
                          label="Prime Operational Balance"
                          color="#0f172a"
                        />
                        <Text fw={700}>
                          ₹{walletInfo?.mainWallet?.toLocaleString()}
                        </Text>
                      </Group>
                    </Paper>
                    <Paper
                      withBorder
                      p="md"
                      radius="md"
                      className={
                        selectedWallet === "commissionWallet"
                          ? classes.activeCard
                          : ""
                      }
                      onClick={() => setSelectedWallet("commissionWallet")}
                      style={{ cursor: "pointer" }}
                    >
                      <Group justify="space-between">
                        <Radio
                          value="commissionWallet"
                          label="Task Reward Yield"
                          color="#0f172a"
                        />
                        <Text fw={700}>
                          ₹{walletInfo?.commissionWallet?.toLocaleString()}
                        </Text>
                      </Group>
                    </Paper>
                  </Stack>
                </Radio.Group>
              </Card>

              {/* Bank Accounts */}
              {!isUSDUser && (
                <Card className={classes.card} p="xl">
                  <Group justify="space-between" mb="md">
                    <Text fw={700} size="sm" c="dimmed">
                      2. SETTLEMENT DESTINATION
                    </Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      leftSection={<FaPlus />}
                      onClick={openAddAccount}
                      disabled={bankAccounts.length >= 4}
                    >
                      Add Endpoint ({bankAccounts.length}/4)
                    </Button>
                  </Group>

                  {bankAccounts.length === 0 ? (
                    <Alert color="gray" icon={<FaInfoCircle />} variant="light">
                      No settlement protocols defined. Please add a bank node or QR
                      endpoint.
                    </Alert>
                  ) : (
                    <Stack gap="sm">
                      {bankAccounts.map((acc: any) => (
                        <Paper
                          key={acc._id}
                          className={`${classes.bankCard} ${
                            selectedAccount === acc._id ? classes.activeCard : ""
                          }`}
                          p="md"
                          onClick={() => setSelectedAccount(acc._id)}
                        >
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="md">
                              <ThemeIcon
                                variant="light"
                                color="indigo"
                                size={40}
                                radius="md"
                              >
                                {acc.accountType === "qr" ? (
                                  <FaQrcode size={18} />
                                ) : (
                                  <FaUniversity size={18} />
                                )}
                              </ThemeIcon>
                              <div>
                                <Group gap={6}>
                                  <Text fw={700} size="sm">
                                    {acc.bankName || acc.qrName}
                                  </Text>
                                  {acc.isDefault && (
                                    <Badge size="xs" color="green">
                                      Primary
                                    </Badge>
                                  )}
                                </Group>
                                <Text size="xs" c="dimmed">
                                  {acc.accountHolderName}
                                </Text>
                              </div>
                            </Group>
                            <Group gap="xs">
                              {!acc.isDefault && (
                                <ActionIcon
                                  variant="light"
                                  color="indigo"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefault(acc._id);
                                  }}
                                >
                                  <FaShieldAlt size={14} />
                                </ActionIcon>
                              )}
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAccount(acc._id);
                                }}
                              >
                                <FaRegTrashAlt size={14} />
                              </ActionIcon>
                            </Group>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Card>
              )}

              {/* Amount Selection */}
              <Card className={classes.card} p="xl">
                <Text fw={700} size="sm" mb="md" c="dimmed">
                  3. LIQUIDATION AMOUNT
                </Text>
                <div className={classes.amountGrid}>
                  {predefinedAmounts.map((amt) => {
                    const disabled = amt > getSelectedWalletBalance();
                    const isSelected = selectedAmount === amt;
                    return (
                      <div
                        key={amt}
                        className={`${classes.amountCard} ${
                          isSelected ? classes.amountSelected : ""
                        } ${disabled ? classes.amountDisabled : ""}`}
                        onClick={() => !disabled && setSelectedAmount(amt)}
                      >
                        <Text fw={700} size="md">
                          ₹{amt.toLocaleString()}
                        </Text>
                        <Text size="xs" opacity={0.6}>
                          {disabled ? "Insufficient" : "Available"}
                        </Text>
                      </div>
                    );
                  })}
                </div>
                {selectedAmount && (
                  <Alert color="green" variant="light" mt="md" icon={<FaCheckCircle />}>
                    <Text size="sm">
                      Disbursal of <strong>₹{selectedAmount.toLocaleString()}</strong>{" "}
                      selected.
                    </Text>
                  </Alert>
                )}
              </Card>

              {/* Security Input */}
              <Card className={classes.card} p="xl">
                <Text fw={700} size="sm" mb="md" c="dimmed">
                  4. SECURITY CLEARANCE
                </Text>
                <Stack gap="lg">
                  <PasswordInput
                    placeholder="Enter Security Lock"
                    value={withdrawalPassword}
                    onChange={(e) => setWithdrawalPassword(e.target.value)}
                    size="md"
                    radius="md"
                    label="Disbursal Password"
                  />
                  <Button
                    className={classes.submitBtn}
                    onClick={handleWithdrawal}
                    loading={createWithdrawalMutation.isPending}
                    disabled={
                      !selectedAmount ||
                      (!isUSDUser && !selectedAccount) ||
                      !withdrawalPassword
                    }
                    leftSection={isUSDUser ? <FaDollarSign /> : <FaArrowRight />}
                    fullWidth
                  >
                    {isUSDUser
                      ? `Request USD Sink ${
                          selectedAmount ? `(₹${selectedAmount.toLocaleString()})` : ""
                        }`
                      : `Finalize Disbursal ${
                          selectedAmount ? `(₹${selectedAmount.toLocaleString()})` : ""
                        }`}
                  </Button>
                </Stack>
              </Card>
            </Stack>
          )}

          {/* ---- Always Show Schedule ---- */}
          <Card className={classes.card} p="xl" mb="xl">
            <Group gap="md" mb="md">
              <ThemeIcon variant="light" color="indigo" radius="md">
                <FaCalendarAlt />
              </ThemeIcon>
              <Text fw={700}>Global Liquidation Schedule</Text>
            </Group>
            <Stack gap={0}>
              {schedule
                .filter((s: any) => s.isActive && s.allowedLevels?.length > 0)
                .map((day: any) => (
                  <div key={day.day} className={classes.scheduleItem}>
                    <Text size="sm" fw={600}>
                      {day.day}
                    </Text>
                    <Group gap="xs">
                      <Badge size="xs" variant="outline">
                        Levels: {day.allowedLevels.join(", ")}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {day.startTime} - {day.endTime}
                      </Text>
                    </Group>
                  </div>
                ))}
            </Stack>
            <Alert color="indigo" icon={<FaInfoCircle />} mt="md" variant="light">
              <Text size="xs">
                Disbursals are processed according to node hierarchy. Please ensure
                your settlement endpoints are verified to prevent transaction failure.
              </Text>
            </Alert>
          </Card>
        </Stack>
      </Container>

      {/* ---- Modal ---- */}
      <Modal
        opened={addAccountOpened}
        onClose={() => {
          closeAddAccount();
          setFormErrors({});
          setActiveTab("bank");
        }}
        title="Register Settlement Endpoint"
        centered
        className={classes.modal}
        size="md"
      >
        <Tabs value={activeTab} onChange={setActiveTab} color="#0f172a">
          <Tabs.List grow mb="xl">
            <Tabs.Tab value="bank" leftSection={<FaUniversity size={14} />}>
              Bank Node
            </Tabs.Tab>
            <Tabs.Tab value="qr" leftSection={<FaQrcode size={14} />}>
              QR Endpoint
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="bank">
            <Stack gap="md">
              <TextInput
                label="Proprietor Name"
                placeholder="Full name as per bank"
                value={accountForm.accountHolderName}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    accountHolderName: e.target.value,
                  })
                }
                error={formErrors.accountHolderName}
              />
              <TextInput
                label="Bank Institution"
                placeholder="e.g. ICICI Bank"
                value={accountForm.bankName}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, bankName: e.target.value })
                }
                error={formErrors.bankName}
              />
              <TextInput
                label="Account Number"
                placeholder="Enter bank account number"
                value={accountForm.accountNumber}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    accountNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
                error={formErrors.accountNumber}
                maxLength={18}
              />
              <TextInput
                label="Verify Number"
                placeholder="Repeat account number"
                value={accountForm.confirmAccountNumber}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    confirmAccountNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
                error={formErrors.confirmAccountNumber}
                maxLength={18}
              />
              <TextInput
                label="Routing Code (IFSC)"
                placeholder="e.g. ICIC0001234"
                value={accountForm.ifscCode}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    ifscCode: e.target.value.toUpperCase(),
                  })
                }
                error={formErrors.ifscCode}
                maxLength={11}
              />
              <Select
                label="Ledger Type"
                data={[
                  { value: "savings", label: "Savings" },
                  { value: "current", label: "Current" },
                ]}
                value={accountForm.accountType}
                onChange={(v) =>
                  setAccountForm({ ...accountForm, accountType: v || "savings" })
                }
              />
              <Button
                fullWidth
                onClick={handleAddBankAccount}
                loading={addBankMutation.isPending}
                mt="md"
                color="#0f172a"
                radius="md"
              >
                Register Bank Node
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="qr">
            <Stack gap="md">
              <TextInput
                label="Endpoint Label"
                placeholder="e.g. PhonePe QR"
                value={qrForm.qrName}
                onChange={(e) =>
                  setQrForm({ ...qrForm, qrName: e.target.value })
                }
                error={formErrors.qrName}
              />
              <TextInput
                label="UPI ID"
                placeholder="user@bank (Optional)"
                value={qrForm.upiId}
                onChange={(e) =>
                  setQrForm({ ...qrForm, upiId: e.target.value })
                }
              />
              <FileInput
                label="QR Vision Data"
                placeholder="Upload QR Image"
                accept="image/*"
                leftSection={<FaImage size={14} />}
                onChange={handleQRImageChange}
                error={formErrors.qrImage}
              />
              {qrForm.qrPreview && (
                <Image
                  src={qrForm.qrPreview}
                  fit="contain"
                  height={160}
                  radius="md"
                  mt="sm"
                />
              )}
              <Button
                fullWidth
                onClick={handleAddQRCode}
                loading={addQRMutation.isPending}
                mt="md"
                color="#0f172a"
                radius="md"
                disabled={!qrForm.qrImage}
              >
                Authorize QR Endpoint
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </div>
  );
};

export default WithdrawalScreen;
