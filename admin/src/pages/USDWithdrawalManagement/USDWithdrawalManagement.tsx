import { useState } from "react";
import {
  Text,
  Group,
  Flex,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Select,
  Modal,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  Card,
  Divider,
  Button,
  Textarea,
  ThemeIcon,
  Stack,
  Title,
  Box,
  SimpleGrid,
} from "@mantine/core";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ShieldCheck,
  Globe,
  Repeat,
} from "lucide-react";

import { FaStripe } from "react-icons/fa";
import { RiExchangeFundsLine } from "react-icons/ri";
import { notifications } from "@mantine/notifications";
import {
  useAllUSDWithdrawals,
  useApproveUSDWithdrawal,
  useRejectUSDWithdrawal,
  useWithdrawalSettings,
  useBitgetBalance,
} from "../../hooks/query/USDWithdrawal.query";
import classes from "./index.module.scss";
import Heading from '../../@ui/common/Heading';

const USDWithdrawalManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const [viewModal, setViewModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = useAllUSDWithdrawals({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const approveUSDWithdrawalMutation = useApproveUSDWithdrawal();
  const rejectUSDWithdrawalMutation = useRejectUSDWithdrawal();
  const { data: settingsData } = useWithdrawalSettings();
  const { data: bitgetBalanceData, isLoading: bitgetLoading, refetch: refetchBitgetBalance } = useBitgetBalance();

  const withdrawals = data?.withdrawals || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  const currentMethod = settingsData?.settings?.bitgetEnabled ? "bitget" : "stripe";

  const handleView = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setViewModal(true);
  };

  const handleApprove = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRemarks("");
    setApproveModal(true);
  };

  const handleReject = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason("");
    setRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      await approveUSDWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        remarks: remarks || `Approved and processed via ${selectedWithdrawal.withdrawalMethod === 'bitget' ? 'Bitget' : 'Stripe'}`,
      });

      const method = selectedWithdrawal.withdrawalMethod === 'bitget' ? 'Bitget (Crypto)' : 'Stripe';
      notifications.show({
        title: "Success",
        message: `USD withdrawal approved and processed via ${method}!`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setApproveModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to approve USD withdrawal",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedWithdrawal) return;

    if (!rejectReason.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide a rejection reason",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      await rejectUSDWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        reason: rejectReason,
      });

      notifications.show({
        title: "Success",
        message: "USD withdrawal rejected. Amount refunded to user's USD Wallet.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setRejectModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reject USD withdrawal",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      pending: { color: "yellow", label: "AWAITING AUDIT", icon: <Clock size={10} /> },
      processing: { color: "blue", label: "IN PROGRESS", icon: <Repeat size={10} /> },
      completed: { color: "green", label: "SETTLED", icon: <CheckCircle size={10} /> },
      rejected: { color: "red", label: "REJECTED", icon: <XCircle size={10} /> },
      failed: { color: "orange", label: "FAILED", icon: <AlertCircle size={10} /> },
    };
    const config = configs[status] || { color: "gray", label: status.toUpperCase(), icon: <AlertCircle size={10} /> };
    return (
      <Badge color={config.color} variant="light" size="sm" radius="xs" leftSection={config.icon} fw={800}>
        {config.label}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    if (method === "bitget") {
      return (
        <Badge color="cyan" variant="filled" size="xs" radius="xs" leftSection={<RiExchangeFundsLine size={10} />} fw={800}>
          BITGET PRO
        </Badge>
      );
    }
    return (
      <Badge color="indigo" variant="filled" size="xs" radius="xs" leftSection={<FaStripe size={10} />} fw={800}>
        STRIPE CORE
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <Alert icon={<AlertCircle size={18} />} title="Institutional Halt" color="red" radius="lg">
        Critical synchronization failure in international treasury nodes.
      </Alert>
    );
  }

  const rows = withdrawals.map((withdrawal: any) => (
    <Table.Tr key={withdrawal._id} style={{ transition: 'all 0.2s ease' }}>
      <Table.Td>
        <Box>
          <Text size="sm" fw={800} c="#2d3748">#{withdrawal._id.slice(-8).toUpperCase()}</Text>
          <Text size="10px" c="dimmed" fw={600}>{formatDate(withdrawal.createdAt)}</Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Box>
          <Text size="sm" fw={700} c="#1a202c">{withdrawal.userId?.name || "N/A"}</Text>
          <Text size="11px" c="dimmed" fw={600}>{withdrawal.userId?.phone || "N/A"}</Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={900} c="emerald.8">
          ${withdrawal.amountUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed" fw={700}>
          ₹{withdrawal.amountINR?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="outline" color="gray" size="xs" radius="xs">₹{withdrawal.exchangeRate}</Badge>
      </Table.Td>
      <Table.Td>{getMethodBadge(withdrawal.withdrawalMethod || "stripe")}</Table.Td>
      <Table.Td>{getStatusBadge(withdrawal.status)}</Table.Td>
      <Table.Td>
        <Tooltip label={withdrawal.withdrawalMethod === "bitget" ? withdrawal.bitgetTxHash : withdrawal.stripeTransferId}>
          <Text size="10px" c="dimmed" fw={700} style={{ fontFamily: 'monospace' }}>
            {withdrawal.withdrawalMethod === "bitget"
              ? (withdrawal.bitgetTxHash ? withdrawal.bitgetTxHash.slice(-8) : "—")
              : (withdrawal.stripeTransferId ? withdrawal.stripeTransferId.slice(-8) : "—")}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Group gap={6} wrap="nowrap">
          <Tooltip label="Examine Record">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleView(withdrawal)}
              radius="md"
            >
              <Eye size={14} />
            </ActionIcon>
          </Tooltip>
          {withdrawal.status === "pending" && (
            <>
              <Tooltip label="Authorize Settlement">
                <ActionIcon
                  variant="light"
                  color="emerald"
                  size="sm"
                  onClick={() => handleApprove(withdrawal)}
                  radius="md"
                >
                  <CheckCircle size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Abort Requisition">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleReject(withdrawal)}
                  radius="md"
                >
                  <XCircle size={14} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="xl" className={classes.container} bg="#fdfdfd" style={{ minHeight: '100vh' }}>
      <Stack gap="xl">
        <Box>
          <Badge variant="light" color="indigo" radius="sm" mb="xs">INTL TREASURY v2.0</Badge>
          <Group justify="space-between" align="flex-end">
            <Box>
              <Heading order={1} fw={900} style={{ letterSpacing: "-1px" }}>Global Capital Egress</Heading>
              <Text c="dimmed" size="sm" fw={500}>Monitor and authorize cross-border capital distributions via encrypted conduits.</Text>
            </Box>
            <Group>
              <Tooltip label="Refresh Global Ledger">
                <ActionIcon variant="light" color="gray" size="xl" radius="md" onClick={() => window.location.reload()}>
                  <RefreshCw size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Box>

        {}
        {settingsData?.settings?.bitgetEnabled && (
          <Paper p="xl" radius="28px" withBorder style={{ borderLeft: '8px solid #00D4AA', background: 'linear-gradient(to right, #00D4AA0a, transparent)' }}>
            <Group justify="space-between">
              <Group gap="lg">
                <ThemeIcon variant="light" color="emerald" size={64} radius="20px">
                  <RiExchangeFundsLine size={32} color="#00D4AA" />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed" fw={800} style={{ letterSpacing: '1px' }}>INSTITUTIONAL BITGET LIQUIDITY</Text>
                  <Group gap="xs" align="baseline">
                    {bitgetLoading ? (
                      <Loader size="sm" color="teal" />
                    ) : bitgetBalanceData?.connected ? (
                      <>
                        <Text size="28px" fw={900} c="#00D4AA">
                          {bitgetBalanceData.balance?.free || '0.00'} {bitgetBalanceData.currency || 'USDT'}
                        </Text>
                        <Badge color="emerald" variant="light" size="sm" radius="md">STABLE</Badge>
                      </>
                    ) : (
                      <Text size="lg" fw={800} c="red.6">NODE DISCONNECTED</Text>
                    )}
                  </Group>
                  <Text size="11px" fw={600} c="dimmed">NETWORK PROTOCOL: {bitgetBalanceData?.network || settingsData?.settings?.bitgetNetwork || 'TRC20'}</Text>
                </Box>
              </Group>
              <Button
                variant="light"
                color="teal"
                radius="xl"
                size="md"
                leftSection={<RefreshCw size={16} />}
                onClick={() => refetchBitgetBalance()}
                loading={bitgetLoading}
              >
                Sync Node
              </Button>
            </Group>
          </Paper>
        )}

        {}
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="lg">
          <Paper p="lg" radius="24px" withBorder style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="lg">
                <Clock size={24} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="blue.2">AWAITING</Badge>
            </Group>
            <Stack gap={0} mt="lg">
              <Text size="22px" fw={900}>{statistics.pendingCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>PENDING APPROVALS</Text>
            </Stack>
          </Paper>

          <Paper p="lg" radius="24px" withBorder style={{ background: "linear-gradient(135deg, #047857 0%, #065f46 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="lg">
                <CheckCircle size={24} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="emerald.2">SETTLED</Badge>
            </Group>
            <Stack gap={0} mt="lg">
              <Text size="22px" fw={900}>${statistics.completedAmountUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</Text>
              <Text size="10px" fw={700} opacity={0.6}>SUCCESSFUL EGRESS</Text>
            </Stack>
          </Paper>

          <Paper p="lg" radius="24px" withBorder style={{ background: "linear-gradient(135deg, #0369a1 0%, #075985 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="lg">
                <Globe size={24} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="sky.2">VOLUME</Badge>
            </Group>
            <Stack gap={0} mt="lg">
              <Text size="22px" fw={900}>{statistics.totalCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>LIFETIME REQUISITIONS</Text>
            </Stack>
          </Paper>

          <Paper p="lg" radius="24px" withBorder style={{ background: "linear-gradient(135deg, #be123c 0%, #9f1239 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="lg">
                <XCircle size={24} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="rose.2">CANCELLED</Badge>
            </Group>
            <Stack gap={0} mt="lg">
              <Text size="22px" fw={900}>{(statistics.failedCount || 0) + (statistics.rejectedCount || 0)}</Text>
              <Text size="10px" fw={700} opacity={0.6}>FAILED/VOIDED</Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Paper p="xl" radius="32px" shadow="0 10px 40px rgba(0,0,0,0.02)" withBorder>
          <Stack gap="lg">
            <Group gap="md">
              <TextInput
                placeholder="Identify payor by identifier or phone conduit..."
                leftSection={<Search size={18} color="#666" />}
                size="md"
                radius="xl"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActivePage(1);
                }}
                style={{ flex: 1 }}
                styles={{ input: { background: '#f8f9fa' } }}
              />
              <Select
                placeholder="Audit Status"
                size="md"
                radius="xl"
                data={[
                  { value: "all", label: "Entire Ledger" },
                  { value: "pending", label: "Under Audit" },
                  { value: "completed", label: "Synchronized" },
                  { value: "rejected", label: "Voided" },
                  { value: "failed", label: "System Failure" },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || "all")}
                w={200}
                styles={{ input: { background: '#f8f9fa' } }}
              />
            </Group>

            <Alert icon={<ShieldCheck size={20} />} color="indigo" variant="light" radius="xl">
              <Text size="xs" fw={700}>EGRESS GOVERNANCE POLICY: Manual audit required for all cross-border capital transmissions via {currentMethod.toUpperCase()} conduits.</Text>
            </Alert>

            <Table.ScrollContainer minWidth={1200}>
              <Table verticalSpacing="md" horizontalSpacing="md">
                <Table.Thead bg="#f8f9fa">
                  <Table.Tr>
                    <Table.Th style={{ borderRadius: '16px 0 0 0' }}>REQUISITION ID</Table.Th>
                    <Table.Th>INVESTOR</Table.Th>
                    <Table.Th>USD VALUE</Table.Th>
                    <Table.Th>INR EQUIVALENT</Table.Th>
                    <Table.Th>SPOT RATE</Table.Th>
                    <Table.Th>CONDUIT</Table.Th>
                    <Table.Th>LEDGER STATUS</Table.Th>
                    <Table.Th>TRACE ID</Table.Th>
                    <Table.Th style={{ borderRadius: '0 16px 0 0' }}>OPS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoading ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <Loader size="lg" color="indigo" />
                          <Text c="dimmed" mt="md" fw={700}>Synchronizing Global Financial Nodes...</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  ) : rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <ThemeIcon size={64} radius="xl" variant="light" color="gray"><Search size={32} /></ThemeIcon>
                          <Text c="dimmed" mt="md" fw={700}>Global ledger is currently empty.</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Flex justify="space-between" align="center" mt="xl" px="md">
              <Text size="sm" c="dimmed" fw={600}>
                Page <Text span fw={800} c="indigo.9">{activePage}</Text> of <Text span fw={800}>{pagination.totalPages || 1}</Text>
              </Text>
              <Pagination
                total={pagination.totalPages || 1}
                value={activePage}
                onChange={setActivePage}
                radius="xl"
                color="indigo"
                size="sm"
              />
            </Flex>
          </Stack>
        </Paper>
      </Stack>

      {}
      <Modal
        opened={approveModal}
        onClose={() => setApproveModal(false)}
        title={<Text fw={900} size="xl">Authorization Protocol: Capital Egress</Text>}
        centered
        radius="28px"
        padding="xl"
        size="lg"
      >
        {selectedWithdrawal && (
          <Stack gap="lg">
            <Paper p="md" radius="lg" bg="indigo.0" style={{ border: '1px solid #c3dafe' }}>
              <Flex gap="sm">
                <ShieldCheck color="#4c51bf" />
                <Box>
                  <Text size="sm" fw={800} c="indigo.9">SETTLEMENT PROTOCOL INITIATED</Text>
                  <Text size="xs" fw={600} c="indigo.8">Authorization will execute an immediate liquid transfer via {selectedWithdrawal.withdrawalMethod?.toUpperCase() || 'CORE'} API.</Text>
                </Box>
              </Flex>
            </Paper>

            <Card withBorder radius="xl" p="xl">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>AMOUNT (USD)</Text>
                  <Title order={2} fw={900} c="emerald.8">${selectedWithdrawal.amountUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Title>
                  <Text size="xs" fw={700} c="dimmed">≈ ₹{selectedWithdrawal.amountINR?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </Box>
                <ThemeIcon size={64} radius="20px" variant="light" color="indigo">
                  <Repeat size={32} />
                </ThemeIcon>
              </Flex>
              <Divider my="lg" />
              <SimpleGrid cols={2} spacing="lg">
                <Box>
                  <Text size="10px" c="dimmed" fw={800}>HOLDER</Text>
                  <Text size="sm" fw={700}>{selectedWithdrawal.userId?.name || "N/A"}</Text>
                </Box>
                <Box>
                  <Text size="10px" c="dimmed" fw={800}>CONDUIT</Text>
                  {getMethodBadge(selectedWithdrawal.withdrawalMethod || "stripe")}
                </Box>
                {selectedWithdrawal.withdrawalMethod === 'bitget' && (
                  <Box style={{ gridColumn: 'span 2' }}>
                    <Text size="10px" c="dimmed" fw={800}>WALLET COORDINATES</Text>
                    <Paper p="xs" radius="md" bg="gray.0" withBorder>
                      <Text size="10px" fw={900} style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedWithdrawal.bitgetWalletAddress || "N/A"}</Text>
                    </Paper>
                  </Box>
                )}
              </SimpleGrid>
            </Card>

            <Alert color="orange" variant="light" radius="md" icon={<AlertCircle size={16} />}>
              <Text size="xs" fw={700}>CRITICAL: This operation is final. Ensure sufficient node liquidity before committing.</Text>
            </Alert>

            <Textarea
              label="INSTITUTIONAL AUDIT REMARKS"
              placeholder="Verified via international risk department..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              radius="md"
              minRows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={() => setApproveModal(false)}>Discard</Button>
              <Button
               color="#0f2027"
                onClick={confirmApprove}
                loading={approveUSDWithdrawalMutation.isPending}
                leftSection={selectedWithdrawal.withdrawalMethod === 'bitget' ? <RiExchangeFundsLine /> : <FaStripe />}
                radius="xl"
                size="md"
              >
                Approve & Settle
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={rejectModal}
        onClose={() => setRejectModal(false)}
        title={<Text fw={900} size="xl">Risk Abort: Capital Egress</Text>}
        centered
        radius="28px"
        padding="xl"
      >
        {selectedWithdrawal && (
          <Stack gap="lg">
            <Paper p="md" radius="lg" bg="red.0" style={{ border: '1px solid #fed7d7' }}>
              <Flex gap="sm">
                <XCircle color="#e53e3e" />
                <Box>
                  <Text size="sm" fw={800} c="red.9">ABORT PROTOCOL ENGAGED</Text>
                  <Text size="xs" fw={600} c="red.8">Requisition will be voided. Internal units will be restored to source node.</Text>
                </Box>
              </Flex>
            </Paper>

            <Card withBorder radius="xl" p="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>VALUE</Text>
                  <Text size="sm" fw={900}>${selectedWithdrawal.amountUSD?.toFixed(2)}</Text>
                </Box>
                <Box ta="right">
                  <Text size="xs" c="dimmed" fw={800}>INVESTOR</Text>
                  <Text size="sm" fw={700}>{selectedWithdrawal.userId?.name}</Text>
                </Box>
              </Group>
            </Card>

            <Textarea
              label="REJECTION JUSTIFICATION"
              placeholder="Specify risk factors or verification failures..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              minRows={4}
              radius="md"
            />

            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={() => setRejectModal(false)}>Cancel</Button>
              <Button
                color="red"
                onClick={confirmReject}
                loading={rejectUSDWithdrawalMutation.isPending}
                leftSection={<XCircle size={16} />}
                radius="xl"
              >
                Execute Abort
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title={<Text fw={900} size="xl">Cross-Border Egress Intelligence</Text>}
        size="lg"
        radius="28px"
        padding="xl"
      >
        {selectedWithdrawal && (
          <Stack gap="xl">
            <Paper p="lg" radius="xl" withBorder bg="gray.0">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>EGRESS REQUISITION ID</Text>
                  <Text fw={900} style={{ fontFamily: 'monospace' }}>#{selectedWithdrawal._id}</Text>
                </Box>
                <Badge size="lg" radius="sm" color="indigo" variant="filled">
                  {selectedWithdrawal.status?.toUpperCase()}
                </Badge>
              </Group>
            </Paper>

            <SimpleGrid cols={2} spacing="xl">
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>INVESTOR PROFILE</Text>
                <Text size="sm" fw={700}>{selectedWithdrawal.userId?.name || "N/A"}</Text>
                <Text size="xs" c="dimmed">{selectedWithdrawal.userId?.phone || "N/A"}</Text>
                <Text size="xs" c="dimmed">{selectedWithdrawal.userId?.email || "N/A"}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>FISCAL COORDINATES</Text>
                <Text size="lg" fw={900} c="emerald.8">${selectedWithdrawal.amountUSD?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                <Text size="xs" c="dimmed">Equivalent: ₹{selectedWithdrawal.amountINR?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                <Text size="xs" c="dimmed">Effective Rate: ₹{selectedWithdrawal.exchangeRate}/USD</Text>
              </Box>
            </SimpleGrid>

            <Divider label="Institutional Routing" labelPosition="center" />

            <SimpleGrid cols={2} spacing="lg">
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>EGRESS CONDUIT</Text>
                {getMethodBadge(selectedWithdrawal.withdrawalMethod || "stripe")}
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>TEMPORARY STAMP</Text>
                <Text size="sm" fw={700}>{formatDate(selectedWithdrawal.createdAt)}</Text>
                {selectedWithdrawal.processedAt && (
                  <Text size="10px" c="emerald.7" fw={800}>SETTLED: {formatDate(selectedWithdrawal.processedAt)}</Text>
                )}
              </Box>
              <Box style={{ gridColumn: 'span 2' }}>
                <Text size="xs" c="dimmed" fw={800} mb={4}>SYSTEM TRACE ID</Text>
                <Paper p="md" radius="md" bg="blue.0" withBorder style={{ borderStyle: 'dashed' }}>
                  <Text size="xs" fw={900} ta="center" style={{ fontFamily: 'monospace' }}>
                    {selectedWithdrawal.withdrawalMethod === "bitget"
                      ? (selectedWithdrawal.bitgetTxHash || selectedWithdrawal.bitgetWithdrawId || "AWAITING BROADCAST")
                      : (selectedWithdrawal.stripeTransferId || "AWAITING API HOOK")}
                  </Text>
                </Paper>
              </Box>
            </SimpleGrid>

            {selectedWithdrawal.remarks && (
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>AUDITOR MEMO</Text>
                <Paper p="md" radius="md" bg="gray.1">
                  <Text size="sm" fs="italic">"{selectedWithdrawal.remarks}"</Text>
                </Paper>
              </Box>
            )}

            <Group justify="flex-end">
              <Button variant="light" color="indigo" radius="xl" onClick={() => setViewModal(false)}>Close Archive</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default USDWithdrawalManagement;
