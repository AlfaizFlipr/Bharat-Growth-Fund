import { useState, useEffect } from "react";
import {
  Text,
  Group,
  Flex,
  Paper,
  Switch,
  Button,
  TextInput,
  NumberInput,
  Select,
  Alert,
  Badge,
  Divider,
  Loader,
  ThemeIcon,
  PasswordInput,
  Stack,
  Box,
  SimpleGrid,
} from "@mantine/core";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Globe,
  Save,
  Lock,
  Key,
  Database,
} from "lucide-react";
import { RiExchangeFundsLine } from "react-icons/ri";
import { FaStripe } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import {
  useWithdrawalSettings,
  useUpdateWithdrawalSettings,
  useTestBitgetConnection,
} from "../../hooks/query/USDWithdrawal.query";
import classes from "./index.module.scss";
import Heading from "../../@ui/common/Heading";

const WithdrawalSettings = () => {
  const { data, isLoading } = useWithdrawalSettings();
  const updateSettingsMutation = useUpdateWithdrawalSettings();
  const testBitgetMutation = useTestBitgetConnection();

  const [formData, setFormData] = useState({
    stripeEnabled: false,
    bitgetEnabled: true,
    bitgetApiKey: "",
    bitgetSecretKey: "",
    bitgetPassphrase: "",
    bitgetNetwork: "trc20",
    bitgetCurrency: "USDT",
    usdExchangeRate: 83,
    minWithdrawalINR: 0.01,
    maxWithdrawalINR: 500000,
    stripeFeePercent: 2.9,
    bitgetFeePercent: 0.1,
    defaultWithdrawalMethod: "bitget" as "stripe" | "bitget",
    notes: "",
  });

  const [bitgetConnected, setBitgetConnected] = useState<boolean | null>(null);
  const [bitgetBalance, setBitgetBalance] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        stripeEnabled: data.settings.stripeEnabled || false,
        bitgetEnabled: data.settings.bitgetEnabled || true,
        bitgetApiKey: "",
        bitgetSecretKey: "",
        bitgetPassphrase: "",
        bitgetNetwork: data.settings.bitgetNetwork || "trc20",
        bitgetCurrency: data.settings.bitgetCurrency || "USDT",
        usdExchangeRate: data.settings.usdExchangeRate || 83,
        minWithdrawalINR: data.settings.minWithdrawalINR || 0.01,
        maxWithdrawalINR: data.settings.maxWithdrawalINR || 500000,
        stripeFeePercent: data.settings.stripeFeePercent || 2.9,
        bitgetFeePercent: data.settings.bitgetFeePercent || 0.1,
        defaultWithdrawalMethod: data.settings.defaultWithdrawalMethod || "bitget",
        notes: data.settings.notes || "",
      });
    }
  }, [data]);

  const handleSaveSettings = async () => {
    try {
      const payload: any = { ...formData };
      if (!payload.bitgetApiKey) delete payload.bitgetApiKey;
      if (!payload.bitgetSecretKey) delete payload.bitgetSecretKey;
      if (!payload.bitgetPassphrase) delete payload.bitgetPassphrase;

      await updateSettingsMutation.mutateAsync(payload);
      notifications.show({
        title: "Success",
        message: "Institutional configurations committed to secure storage.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Registry Error",
        message: error.response?.data?.message || "Critical failure during configuration commit.",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const handleTestBitget = async () => {
    try {
      const result = await testBitgetMutation.mutateAsync();
      setBitgetConnected(result.connected);
      if (result.balance) {
        setBitgetBalance(`${result.balance.free} ${result.currency}`);
      }
      notifications.show({
        title: "Node Synchronized",
        message: `Secure handshake established. Liquid balance detected.`,
        color: "teal",
        icon: <CheckCircle size={18} />,
      });
    } catch (error: any) {
      setBitgetConnected(false);
      notifications.show({
        title: "Handshake Failure",
        message: error.response?.data?.message || "Bitget API rejected synchronization request.",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" direction="column" align="center" style={{ height: "400px" }}>
        <Loader size="lg" color="blue" />
        <Text c="dimmed" mt="md" fw={700}>Synchronizing Control Grid...</Text>
      </Flex>
    );
  }

  return (
    <Box p="xl" className={classes.container} bg="#fdfdfd" style={{ minHeight: '100vh' }}>
      <Stack gap="xl">
        <Box>
          <Badge variant="light" color="blue" radius="sm" mb="xs">CONTROL LAYER v2.0</Badge>
          <Group justify="space-between">
            <Box>
              <Heading order={1} fw={900} style={{ letterSpacing: "-1px" }}>Institutional Config</Heading>
              <Text c="dimmed" size="sm" fw={500}>Configure encryption keys, liquidity conduits, and fiscal thresholds for the international treasury.</Text>
            </Box>
            <Button
              onClick={handleSaveSettings}
              loading={updateSettingsMutation.isPending}
              leftSection={<Save size={16} />}
              bg="blue.9"
              radius="xl"
              size="md"
              styles={{ root: { boxShadow: '0 4px 15px rgba(30, 58, 138, 0.2)' } }}
            >
              Commit Changes
            </Button>
          </Group>
        </Box>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {}
          <Stack gap="lg">
            <Paper p="xl" radius="32px" withBorder shadow="0 10px 40px rgba(0,0,0,0.02)">
              <Group gap="sm" mb="xl">
                <ThemeIcon variant="light" color="blue" size={40} radius="md">
                  <Globe size={20} />
                </ThemeIcon>
                  <Heading order={3} fw={900}>Liquidity Conduits</Heading>
              </Group>

              <Stack gap="md">
                {}
                <Paper p="lg" radius="20px" withBorder bg={formData.stripeEnabled ? "indigo.0" : "gray.0"} style={{ borderColor: formData.stripeEnabled ? '#c3dafe' : '#eee' }}>
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon size={44} radius="lg" bg="indigo" variant="filled">
                        <FaStripe size={24} color="#fff" />
                      </ThemeIcon>
                      <Box>
                        <Text fw={800} size="sm">STRIPE CORE</Text>
                        <Text size="xs" c="dimmed" fw={600}>Direct Bank Infrastructure</Text>
                      </Box>
                    </Group>
                    <Switch
                      checked={formData.stripeEnabled}
                      onChange={(e) => setFormData({ ...formData, stripeEnabled: e.target.checked })}
                      color="indigo"
                      size="md"
                    />
                  </Group>
                </Paper>

                {}
                <Paper p="lg" radius="20px" withBorder bg={formData.bitgetEnabled ? "teal.0" : "gray.0"} style={{ borderColor: formData.bitgetEnabled ? '#b2f5ea' : '#eee' }}>
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon size={44} radius="lg" bg="#00D4AA" variant="filled">
                        <RiExchangeFundsLine size={24} color="#fff" />
                      </ThemeIcon>
                      <Box>
                        <Text fw={800} size="sm">BITGET PRO</Text>
                        <Text size="xs" c="dimmed" fw={600}>USDT Crypto Infrastructure</Text>
                      </Box>
                    </Group>
                    <Switch
                      checked={formData.bitgetEnabled}
                      onChange={(e) => setFormData({ ...formData, bitgetEnabled: e.target.checked })}
                      color="teal"
                      size="md"
                    />
                  </Group>
                  {(bitgetConnected !== null || bitgetBalance) && (
                    <Group mt="sm" gap={6}>
                      {bitgetConnected !== null && (
                        <Badge color={bitgetConnected ? "emerald" : "red"} size="xs" variant="filled" radius="xs" fw={800}>
                          {bitgetConnected ? "SYNCHRONIZED" : "HANDSHAKE FAILED"}
                        </Badge>
                      )}
                      {bitgetBalance && (
                        <Badge color="blue" variant="light" size="xs" radius="xs" fw={800}>
                          RESERVE: {bitgetBalance}
                        </Badge>
                      )}
                    </Group>
                  )}
                </Paper>

                <Divider my="md" label="Ingress Priority" labelPosition="center" />

                <Select
                  label="PRIMARY SETTLEMENT METHOD"
                  description="Automatic routing for non-specified requisitions"
                  value={formData.defaultWithdrawalMethod}
                  onChange={(value) => setFormData({ ...formData, defaultWithdrawalMethod: value as "stripe" | "bitget" })}
                  data={[
                    { value: "bitget", label: "BITGET (Crypto Conduit)" },
                    { value: "stripe", label: "STRIPE (Legacy Banking)" },
                  ]}
                  radius="md"
                  size="md"
                />
              </Stack>
            </Paper>

            {}
            <Paper p="xl" radius="32px" withBorder shadow="0 10px 40px rgba(0,0,0,0.02)">
              <Group gap="sm" mb="xl">
                <ThemeIcon variant="light" color="indigo" size={40} radius="md">
                  <DollarSign size={20} />
                </ThemeIcon>
                <Heading order={3} fw={900}>Fiscal Thresholds</Heading>
              </Group>

              <Stack gap="md">
                <NumberInput
                  label="MINIMUM REQUISITION (INR)"
                  description="Minimum allowable unit transfer"
                  value={formData.minWithdrawalINR}
                  onChange={(value) => setFormData({ ...formData, minWithdrawalINR: Number(value) || 0.01 })}
                  radius="md"
                  prefix="₹"
                  fw={700}
                />
                <NumberInput
                  label="MAXIMUM REQUISITION (INR)"
                  description="Maximum institutional ceiling"
                  value={formData.maxWithdrawalINR}
                  onChange={(value) => setFormData({ ...formData, maxWithdrawalINR: Number(value) || 500000 })}
                  radius="md"
                  prefix="₹"
                  fw={700}
                />
                <NumberInput
                  label="INSTITUTIONAL SPOT RATE"
                  description="Current 1 USD valuation in INR"
                  value={formData.usdExchangeRate}
                  onChange={(value) => setFormData({ ...formData, usdExchangeRate: Number(value) || 83 })}
                  radius="md"
                  decimalScale={2}
                  prefix="₹"
                  fw={900}
                  c="blue.9"
                />
              </Stack>
            </Paper>
          </Stack>

          {}
          <Stack gap="lg">
            <Paper p="xl" radius="32px" withBorder shadow="0 10px 40px rgba(0,0,0,0.02)">
              <Group justify="space-between" mb="xl">
                <Group gap="sm">
                  <ThemeIcon variant="light" color="teal" size={40} radius="md">
                    <Database size={20} />
                  </ThemeIcon>
                  <Heading order={3} fw={900}>Interface Encryption</Heading>
                </Group>
                <Button
                  variant="light"
                  color="teal"
                  size="xs"
                  radius="xl"
                  onClick={handleTestBitget}
                  loading={testBitgetMutation.isPending}
                  leftSection={<RefreshCw size={14} />}
                >
                  Sync Nodes
                </Button>
              </Group>

              <Alert icon={<ShieldCheck size={18} />} color="teal" variant="light" radius="lg" mb="xl">
                <Text size="xs" fw={700}>RSA-4096 Storage: Credentials are encrypted and stored in institutional vaults. Field updates override existing keys.</Text>
              </Alert>

              <Stack gap="md">
                <PasswordInput
                  label="API IDENTIFIER"
                  placeholder={data?.settings?.bitgetApiKeyConfigured ? "SECURED IN VAULT" : "Input API Requisitioner ID"}
                  value={formData.bitgetApiKey}
                  onChange={(e) => setFormData({ ...formData, bitgetApiKey: e.target.value })}
                  radius="md"
                  leftSection={<Key size={14} />}
                />
                <PasswordInput
                  label="PRIVATE SIGNING KEY"
                  placeholder={data?.settings?.bitgetApiKeyConfigured ? "SECURED IN VAULT" : "Input Primary Secret"}
                  value={formData.bitgetSecretKey}
                  onChange={(e) => setFormData({ ...formData, bitgetSecretKey: e.target.value })}
                  radius="md"
                  leftSection={<Lock size={14} />}
                />
                <PasswordInput
                  label="VAULT PASSPHRASE"
                  placeholder={data?.settings?.bitgetApiKeyConfigured ? "SECURED IN VAULT" : "Input Access Code"}
                  value={formData.bitgetPassphrase}
                  onChange={(e) => setFormData({ ...formData, bitgetPassphrase: e.target.value })}
                  radius="md"
                  leftSection={<ShieldCheck size={14} />}
                />

                <SimpleGrid cols={2}>
                  <Select
                    label="NETWORK PROTOCOL"
                    value={formData.bitgetNetwork}
                    onChange={(value) => setFormData({ ...formData, bitgetNetwork: value || "trc20" })}
                    data={[
                      { value: "trc20", label: "TRON (TRC20)" },
                      { value: "bep20", label: "BSC (BEP20)" },
                      { value: "erc20", label: "ETH (ERC20)" },
                      { value: "matic", label: "POLYGON" },
                    ]}
                    radius="md"
                  />
                  <Select
                    label="ASSET CURRENCY"
                    value={formData.bitgetCurrency}
                    onChange={(value) => setFormData({ ...formData, bitgetCurrency: value || "USDT" })}
                    data={[
                      { value: "USDT", label: "USDT-CORE" },
                      { value: "USDC", label: "USDC-STABLE" },
                    ]}
                    radius="md"
                  />
                </SimpleGrid>
              </Stack>
            </Paper>

            <Paper p="xl" radius="32px" withBorder shadow="0 10px 40px rgba(0,0,0,0.02)">
              <Group gap="sm" mb="xl">
                <ThemeIcon variant="light" color="orange" size={40} radius="md">
                  <TrendingUp size={20} />
                </ThemeIcon>
                <Heading order={3} fw={900}>Surcharge Algorithms</Heading>
              </Group>

              <Stack gap="md">
                <NumberInput
                  label="STRIPE ADMINISTRATIVE SURCHARGE (%)"
                  value={formData.stripeFeePercent}
                  onChange={(value) => setFormData({ ...formData, stripeFeePercent: Number(value) || 2.9 })}
                  radius="md"
                  suffix="%"
                  decimalScale={2}
                  fw={700}
                />
                <NumberInput
                  label="BITGET TRANSMISSION SURCHARGE (%)"
                  value={formData.bitgetFeePercent}
                  onChange={(value) => setFormData({ ...formData, bitgetFeePercent: Number(value) || 0.1 })}
                  radius="md"
                  suffix="%"
                  decimalScale={2}
                  fw={700}
                />
                <Alert icon={<AlertCircle size={16} />} color="blue" variant="light" radius="md">
                  <Text size="xs" fw={700}>Note: Blockchain network fees (~$1-5) are volatile and handled by the protocol layer during transmission.</Text>
                </Alert>
              </Stack>
            </Paper>

            <Paper p="xl" radius="32px" withBorder shadow="0 10px 40px rgba(0,0,0,0.02)">
              <TextInput
                label="TREASURY DIRECTIVE (INTERNAL MEMO)"
                placeholder="Record operational changes or maintenance windows..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                radius="md"
              />
            </Paper>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Box>
  );
};

export default WithdrawalSettings;
