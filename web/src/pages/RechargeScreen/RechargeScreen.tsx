import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  NumberInput,
  Loader,
  Radio,
  Divider,
  Alert,
  Image,
  Stack,
  Paper,
  TextInput,
  Center,
  Box,
  Container,
  ActionIcon,
  ThemeIcon,
  FileInput,
  Badge,
  Group,
} from "@mantine/core";
import {
  useWalletInfoQuery,
  usePaymentMethodsQuery,
  useCreateRechargeOrderMutation,
  useVerifyRechargePaymentMutation,
} from "../../hooks/query/useRecharge.query";
import classes from "./RechargeScreen.module.scss";
import {
  Wallet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Coins,
  Building2,
  Info,
  ShieldCheck,
  QrCode,
  Copy,
  Zap,
} from "lucide-react";
import { notifications } from "@mantine/notifications";

const RechargeStep = {
  SELECT_AMOUNT: 1,
  SELECT_PAYMENT: 2,
  PAYMENT_DETAILS: 3,
  SUBMIT_UTR: 4,
  SUCCESS: 5,
} as const;

type RechargeStep = (typeof RechargeStep)[keyof typeof RechargeStep];

const RechargeScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RechargeStep>(
    RechargeStep.SELECT_AMOUNT
  );
  const [customAmount, setCustomAmount] = useState<number | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [dynamicQRCode, setDynamicQRCode] = useState<string | null>(null);

  
  const {
    data: walletInfo,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWalletInfoQuery();
  const { data: paymentMethods = [], isLoading: paymentLoading } =
    usePaymentMethodsQuery();

  const createOrderMutation = useCreateRechargeOrderMutation();
  const verifyPaymentMutation = useVerifyRechargePaymentMutation();

  
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      const activeMethod = paymentMethods.find((m: any) => m.isActive);
      if (activeMethod) {
        setSelectedPaymentMethod(activeMethod._id);
      }
    }
  }, [paymentMethods, selectedPaymentMethod]);

  const getSelectedAmount = () => customAmount || 0;

  const handleAmountNext = () => {
    if (getSelectedAmount() > 0) {
      setCurrentStep(RechargeStep.SELECT_PAYMENT);
    }
  };

  const handlePaymentMethodNext = () => {
    if (!selectedPaymentMethod) return;

    const amount = getSelectedAmount();
    createOrderMutation.mutate(
      { amount, paymentMethodId: selectedPaymentMethod },
      {
        onSuccess: (data) => {
          
          const order = data?.order || data?.data?.order;
          
          if (order) {
            setPaymentDetails(order);

            if (order?.dynamicQRCode) {
              setDynamicQRCode(order.dynamicQRCode);
            } else if (order?.paymentDetails?.qrCode) {
              setDynamicQRCode(order.paymentDetails.qrCode);
            }

            setCurrentStep(RechargeStep.PAYMENT_DETAILS);
          }
        },
      }
    );
  };

  const handleProceedToUTR = () => {
    setCurrentStep(RechargeStep.SUBMIT_UTR);
  };

  const handleSubmitUTR = () => {
    if (!transactionId.trim() || transactionId.trim().length < 10) return;

    const formData = new FormData();
    formData.append("orderId", paymentDetails._id);
    formData.append("transactionId", transactionId.trim());
    if (paymentProof) {
      formData.append("paymentProof", paymentProof);
    }

    verifyPaymentMutation.mutate(formData, {
      onSuccess: (data) => {
        setOrderData(data.order);
        setCurrentStep(RechargeStep.SUCCESS);
        refetchWallet();
      },
    });
  };

  const handleComplete = () => {
    
    setCurrentStep(RechargeStep.SELECT_AMOUNT);
    setCustomAmount(undefined);
    setTransactionId("");
    setPaymentProof(null);
    setPaymentDetails(null);
    setOrderData(null);
    setDynamicQRCode(null);
  };

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000, 50000];

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    notifications.show({
      title: "Copied!",
      message: `${label} copied to clipboard`,
      color: "blue",
    });
  };

  const renderStepIndicator = () => {
    const steps = [
      { step: RechargeStep.SELECT_AMOUNT, label: "Amount" },
      { step: RechargeStep.SELECT_PAYMENT, label: "Gateway" },
      { step: RechargeStep.PAYMENT_DETAILS, label: "Transfer" },
      { step: RechargeStep.SUBMIT_UTR, label: "Confirm" },
    ];

    return (
      <Flex justify="space-between" style={{ position: 'relative' }}>
        {}
        <Box
          style={{
            position: 'absolute',
            top: '18px',
            left: '10%',
            right: '10%',
            height: '2px',
            background: '#e2e8f0',
            zIndex: 0
          }}
        />
        {steps.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isActive = currentStep === s.step;

          return (
            <Flex key={s.step} direction="column" align="center" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <ThemeIcon
                size={36}
                radius="xl"
                color={isCompleted || isActive ? "blue" : "gray.3"}
                variant={isCompleted || isActive ? "filled" : "light"}
                className={classes.stepIcon}
                style={{
                  boxShadow: isActive ? '0 0 15px rgba(49, 130, 206, 0.4)' : 'none',
                  border: isActive ? '2px solid white' : 'none'
                }}
              >
                {isCompleted ? <CheckCircle2 size={18} /> :
                  <Text size="sm" fw={900}>{idx + 1}</Text>}
              </ThemeIcon>
              <Text
                size="10px"
                mt={6}
                fw={isActive ? 800 : 600}
                c={isActive ? "blue.8" : "dimmed"}
                style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {s.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    );
  };

  const renderAmountSelection = () => (
    <Stack gap="md">
      <Paper radius="24px" p="xl" withBorder className={classes.card} bg="linear-gradient(135deg, #0f2027 0%, #203a43 100%)" shadow="md">
        <Flex justify="space-between" align="center">
          <Box>
            <Text size="xs" c="blue.1" fw={800} style={{ letterSpacing: 1 }}>Main Wallet Amount</Text>
            <Text size="32px" fw={900} c="white" style={{ letterSpacing: -1 }}>₹{walletInfo?.mainWallet?.toLocaleString() || "0.00"}</Text>
          </Box>
          <ThemeIcon size={54} radius="xl" color="rgba(255,255,255,0.1)">
            <Wallet size={28} color="white" />
          </ThemeIcon>
        </Flex>
      </Paper>

      <Paper radius="32px" p="xl" withBorder className={classes.card}>
        <Group justify="space-between" mb="lg">
          <Text fw={900} size="lg" c="#1a365d">Amount</Text>
          <Badge color="#203a43" variant="light" size="sm" radius="sm">INR GATEWAY</Badge>
        </Group>

        <NumberInput
          size="xl"
          placeholder="Enter custom amount"
          value={customAmount}
          onChange={(val) => setCustomAmount(val as number)}
          min={500}
          hideControls
          leftSection={<Text fw={900} c="blue">₹</Text>}
          radius="xl"
          styles={{
            input: {
              fontSize: '24px',
              fontWeight: 900,
              height: '70px',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
            }
          }}
        />

        <div className={classes.amountGrid}>
          {predefinedAmounts.map((amt) => (
            <div
              key={amt}
              className={`${classes.amountCard} ${customAmount === amt ? classes.amountSelected : ""}`}
              onClick={() => setCustomAmount(amt)}
            >
              <Text fw={800} size="sm">₹{amt.toLocaleString()}</Text>
            </div>
          ))}
        </div>

        <Alert mt="xl" variant="light" color="#203a43" radius="lg" icon={<Info size={18} />}>
          <Text size="xs" fw={600}>Minimum recharge amount: ₹500. Funds will be credited to your wallet post-verification.</Text>
        </Alert>
      </Paper>

      <Button
        fullWidth
        size="lg"
        radius="xl"
        color="#203a43"
        onClick={handleAmountNext}
        disabled={!customAmount || customAmount < 500}
        rightSection={<ArrowRight size={18} />}
        style={{ height: 60, fontSize: 18, fontWeight: 900, boxShadow: '0 10px 20px rgba(49, 130, 206, 0.2)' }}
      >
        SELECT PAYMENT GATEWAY
      </Button>
    </Stack>
  );

  const renderPaymentMethodSelection = () => (
    <Stack gap="md">
      <Paper radius="24px" p="lg" withBorder className={classes.card}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text size="xs" c="dimmed" fw={800} style={{ letterSpacing: 0.5 }}>RECHARGE AMOUNT</Text>
            <Text size="22px" fw={900} c="blue.9">₹{customAmount?.toLocaleString()}</Text>
          </Box>
          <ActionIcon
            variant="light"
            color="#203a43"
            size="lg"
            radius="md"
            onClick={() => setCurrentStep(RechargeStep.SELECT_AMOUNT)}
          >
            <ArrowLeft size={20} />
          </ActionIcon>
        </Flex>
      </Paper>

      <Group justify="space-between" align="center" px="xs">
        <Text fw={900} size="md" c="#1a365d">Payment Gateways</Text>
        <ThemeIcon variant="subtle" color="#203a43">
          <ShieldCheck size={18} />
        </ThemeIcon>
      </Group>

      {paymentMethods.length === 0 ? (
        <Alert color="#203a43" variant="light" icon={<Info size={18} />}>No active payment routes found.</Alert>
      ) : (
        <Stack gap="sm">
          {paymentMethods
            .filter((m: any) => m.isActive)
            .map((method: any) => (
              <Paper
                key={method._id}
                p="xl"
                radius="24px"
                withBorder
                className={`${classes.paymentCard} ${selectedPaymentMethod === method._id ? classes.activeCard : ""}`}
                onClick={() => setSelectedPaymentMethod(method._id)}
              >
                <Flex align="center" gap="lg">
                  <ThemeIcon size={54} radius="xl" color="#203a43" variant="light">
                    {method.methodType === 'usdt' ? <Coins size={28} /> : <Building2 size={28} />}
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text fw={900} size="md">{method.methodName}</Text>
                    <Text size="xs" c="dimmed" fw={600}>{method.description || 'Secure Payment Route'}</Text>
                  </Box>
                  <Radio
                    checked={selectedPaymentMethod === method._id}
                    color="#203a43"
                    value={method._id}
                    onChange={() => { }}
                    styles={{ radio: { cursor: 'pointer' } }}
                  />
                </Flex>
              </Paper>
            ))}
        </Stack>
      )}

      <Button
        fullWidth
        size="lg"
        radius="xl"
        color="#203a43"
        mt="md"
        loading={createOrderMutation.isPending}
        onClick={handlePaymentMethodNext}
        disabled={!selectedPaymentMethod}
        style={{ height: 60, fontSize: 18, fontWeight: 900, boxShadow: '0 10px 20px rgba(49, 130, 206, 0.15)' }}
        rightSection={<Zap size={18} />}
      >
        PROCEED TO PAY
      </Button>
    </Stack>
  );

  const renderPaymentDetails = () => {
    if (!paymentDetails) return null;
    const method = paymentDetails.paymentDetails;
    const qrCodeToShow = dynamicQRCode || method?.qrCode;

    
    const getQRCodeSrc = (code: string) => {
      if (!code) return null;
      if (code.startsWith("data:image")) return code;
      if (code.startsWith("http")) return code;
      return `${import.meta.env.VITE_PUBLIC_BASE_URL}/${code}`;
    };

    const qrCodeSrc = getQRCodeSrc(qrCodeToShow);

    return (
      <Stack gap="md">
        <Paper radius="32px" p="xl" withBorder className={classes.card}>
          <Stack align="center" mb="xl">
            <Badge color="#203a43" size="lg" radius="sm">PAYMENT DETAILS</Badge>
            <Text size="36px" fw={900} c="blue.9" style={{ letterSpacing: -1 }}>₹{paymentDetails.amount?.toLocaleString()}</Text>
          </Stack>

          {}
          <Paper p="md" radius="lg" mb="lg" bg="#f8fafc" withBorder>
            <Flex justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" fw={800}>ORDER ID</Text>
              <Text size="sm" fw={700}>{paymentDetails.orderId}</Text>
            </Flex>
          </Paper>

          {}
          {method?.methodType === "upi" && qrCodeSrc ? (
            <Center mb="xl">
              <Box className={classes.qrContainer}>
                <Image
                  src={qrCodeSrc}
                  w={220}
                  h={220}
                  fit="contain"
                  style={{ border: "2px solid #228be6", borderRadius: 8 }}
                />
                <Flex justify="center" align="center" gap="xs" mt="md">
                  <QrCode size={16} color="#3182ce" />
                  <Text size="xs" fw={800} c="blue.7">SCAN VIA ANY UPI APP</Text>
                </Flex>
                {method?.upiId && (
                  <Paper p="sm" mt="md" radius="md" bg="blue.0" withBorder style={{ borderColor: '#bee3f8' }}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text size="10px" c="dimmed" fw={800}>UPI ID</Text>
                        <Text fw={900} c="blue.8">{method.upiId}</Text>
                      </Box>
                      <ActionIcon variant="subtle" onClick={() => handleCopy(method.upiId, 'UPI ID')}><Copy size={16} /></ActionIcon>
                    </Flex>
                  </Paper>
                )}
              </Box>
            </Center>
          ) : method?.methodType === "bank" ? (
            
            <Stack gap="md" mb="xl">
              <Box className={classes.detailRow}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text size="10px" c="dimmed" fw={800}>BANK NAME</Text>
                    <Text fw={900}>{method?.bankName || "N/A"}</Text>
                  </Box>
                  <ActionIcon variant="subtle" onClick={() => handleCopy(method?.bankName || '', 'Bank Name')}><Copy size={16} /></ActionIcon>
                </Flex>
              </Box>

              <Box className={classes.detailRow}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text size="10px" c="dimmed" fw={800}>ACCOUNT HOLDER</Text>
                    <Text fw={900}>{method?.accountName || "N/A"}</Text>
                  </Box>
                  <ActionIcon variant="subtle" onClick={() => handleCopy(method?.accountName || '', 'Holder Name')}><Copy size={16} /></ActionIcon>
                </Flex>
              </Box>

              <Box className={classes.detailRow}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text size="10px" c="dimmed" fw={800}>ACCOUNT NUMBER</Text>
                    <Text fw={900} size="lg" style={{ letterSpacing: 1 }}>{method?.accountNumber || "N/A"}</Text>
                  </Box>
                  <ActionIcon variant="subtle" onClick={() => handleCopy(method?.accountNumber || '', 'Account Number')}><Copy size={16} /></ActionIcon>
                </Flex>
              </Box>

              <Box className={classes.detailRow}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text size="10px" c="dimmed" fw={800}>IFSC ROUTING CODE</Text>
                    <Text fw={900}>{method?.ifscCode || "N/A"}</Text>
                  </Box>
                  <ActionIcon variant="subtle" onClick={() => handleCopy(method?.ifscCode || '', 'IFSC Code')}><Copy size={16} /></ActionIcon>
                </Flex>
              </Box>
            </Stack>
          ) : (
            
            <Alert color="yellow" icon={<Info size={18} />} mb="xl">
              Payment details not available for this method. Please contact support.
            </Alert>
          )}

          <Alert variant="light" color="#203a43" radius="xl" icon={<Info size={20} />}>
            <Text size="xs" fw={600}>Transfer the exact amount, then click below to submit your transaction details.</Text>
          </Alert>
        </Paper>

        <Button
          fullWidth
          size="lg"
          radius="xl"
          color="#203a43"
          style={{ height: 60, fontWeight: 900, boxShadow: '0 10px 20px rgba(49, 130, 206, 0.2)' }}
          onClick={handleProceedToUTR}
        >
          I HAVE SENT THE MONEY
        </Button>
        <Button variant="subtle" color="gray" onClick={() => setCurrentStep(RechargeStep.SELECT_PAYMENT)}>
          Cancel Recharge
        </Button>
      </Stack>
    );
  };

  const renderUTRSubmission = () => (
    <Stack gap="md">
      <Paper radius="32px" p="xl" withBorder className={classes.card}>
        <Stack align="center" mb="xl">
          <Badge color="#203a43" size="lg" radius="sm">PAYMENT PROOF</Badge>
          <Text fw={900} size="xl" c="#1a365d">Verify Transaction</Text>
        </Stack>

        <TextInput
          label="Transaction Reference (UTR)"
          placeholder="12-digit UTR Number"
          size="lg"
          radius="md"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
          mb="xl"
          description="Find this in your payment app under transaction details"
          error={
            transactionId && transactionId.length < 10
              ? "UTR must be at least 10 characters"
              : undefined
          }
          styles={{
            label: { fontWeight: 800, fontSize: '13px', marginBottom: '8px', color: '#4a5568' },
            input: { backgroundColor: '#f8fafc', fontWeight: 700 }
          }}
        />

        <FileInput
          label="Payment Screenshot"
          placeholder="Upload screenshot"
          accept="image/*"
          size="lg"
          radius="md"
          value={paymentProof}
          onChange={setPaymentProof}
          mb="md"
          styles={{
            label: { fontWeight: 800, fontSize: '13px', marginBottom: '8px', color: '#4a5568' },
            input: { backgroundColor: '#f8fafc' }
          }}
          leftSection={<QrCode size={18} />}
        />
        {paymentProof && (
          <Paper p="xs" radius="md" bg="blue.0" withBorder style={{ borderColor: '#bee3f8' }}>
            <Flex align="center" gap="xs">
              <CheckCircle2 size={14} color="#3182ce" />
              <Text size="xs" fw={700} c="blue.8">{paymentProof.name}</Text>
            </Flex>
          </Paper>
        )}
      </Paper>

      <Button
        fullWidth
        size="lg"
        radius="xl"
        color="#203a43"
        loading={verifyPaymentMutation.isPending}
        disabled={!transactionId || transactionId.length < 10}
        onClick={handleSubmitUTR}
        style={{ height: 60, fontSize: 18, fontWeight: 900, boxShadow: '0 10px 20px rgba(49, 130, 206, 0.2)' }}
      >
        SUBMIT VERIFICATION
      </Button>
      <Button variant="subtle" color="gray" onClick={() => setCurrentStep(RechargeStep.PAYMENT_DETAILS)}>
        Modify Transfer Info
      </Button>
    </Stack>
  );

  const renderSuccess = () => (
    <Stack gap="xl" align="center" py="xl">
      <ThemeIcon size={100} radius="xl" color="#203a43" variant="light" style={{ background: 'rgba(49, 130, 206, 0.1)' }}>
        <ShieldCheck size={54} color="#3182ce" />
      </ThemeIcon>

      <Box style={{ textAlign: 'center' }}>
        <Text size="28px" fw={900} c="#1a365d" style={{ letterSpacing: -1 }}>Recharge Submitted</Text>
        <Text size="sm" c="dimmed" mt="xs" fw={600}>Your recharge is being verified.</Text>
      </Box>

      <Paper w="100%" radius="32px" p="xl" withBorder style={{ background: '#f8fafc' }}>
        <Stack gap="md">
          <Flex justify="space-between">
            <Text size="xs" c="dimmed" fw={800}>ORDER ID</Text>
            <Text size="sm" fw={900}>#{paymentDetails?.orderId}</Text>
          </Flex>
          <Divider style={{ borderStyle: 'dashed' }} />
          <Flex justify="space-between">
            <Text size="xs" c="dimmed" fw={800}>AMOUNT</Text>
            <Text size="lg" fw={900} c="blue.9">₹{paymentDetails?.amount?.toLocaleString()}</Text>
          </Flex>
          <Divider style={{ borderStyle: 'dashed' }} />
          <Flex justify="space-between">
            <Text size="xs" c="dimmed" fw={800}>TRANSACTION ID</Text>
            <Text size="sm" fw={900}>{orderData?.transactionId || transactionId}</Text>
          </Flex>
          <Divider style={{ borderStyle: 'dashed' }} />
          <Flex justify="space-between" align="center">
            <Text size="xs" c="dimmed" fw={800}>STATUS</Text>
            <Badge color="orange" variant="filled" size="sm" radius="sm">PENDING</Badge>
          </Flex>
        </Stack>
      </Paper>

      <Text ta="center" size="xs" c="dimmed" px="xl">
        Verification usually completes within 5-30 minutes. You will receive a notification once funds are available.
      </Text>

      <Button
        fullWidth
        size="lg"
        radius="xl"
        color="#203a43"
        onClick={handleComplete}
        style={{ height: 60, fontWeight: 900, boxShadow: '0 10px 20px rgba(49, 130, 206, 0.2)' }}
      >
        DONE
      </Button>
    </Stack>
  );

  if (walletLoading || paymentLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="green" />
      </Center>
    );
  }

  return (
    <Box bg="#f8fafc" style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {}
      <Box
        style={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 100%)",
          padding: "30px 20px 50px",
          borderRadius: "0 0 35px 35px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            filter: 'blur(50px)'
          }}
        />

        <Stack align="center" gap={4}>
          <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="xl">
            <Zap size={24} color="#d4af37" />
          </ThemeIcon>
          <Text size="22px" fw={900} style={{ letterSpacing: '-0.5px' }}>Recharge</Text>
          <Text size="xs" c="rgba(255,255,255,0.5)" ta="center">
            Securely allocate funds to your account.
          </Text>
        </Stack>
      </Box>

      <Container size="sm" p="md">
        {currentStep !== RechargeStep.SUCCESS && (
          <Paper radius="32px" p="md" mb="xl" withBorder style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            {renderStepIndicator()}
          </Paper>
        )}

        <Box style={{ position: 'relative', zIndex: 1 }}>
          {currentStep === RechargeStep.SELECT_AMOUNT && renderAmountSelection()}
          {currentStep === RechargeStep.SELECT_PAYMENT && renderPaymentMethodSelection()}
          {currentStep === RechargeStep.PAYMENT_DETAILS && renderPaymentDetails()}
          {currentStep === RechargeStep.SUBMIT_UTR && renderUTRSubmission()}
          {currentStep === RechargeStep.SUCCESS && renderSuccess()}
        </Box>
      </Container>
    </Box>
  );
};

export default RechargeScreen;
