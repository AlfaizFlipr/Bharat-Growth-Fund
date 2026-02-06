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
  Button,
  Modal,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  Textarea,
  Card,
  CopyButton,
  Image,
  ThemeIcon,
  Stack,
  Box,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Eye,
  Copy,
  ShieldCheck,
  CreditCard,
  QrCode,
  History,
  TrendingDown,
  ExternalLink,
  Save,
  ShieldAlert,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import {
  useAllWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useWithdrawalStatistics,
} from "../../hooks/query/Withdrawal.query";
import classes from "./index.module.scss";
import Heading from '../../@ui/common/Heading';

const WithdrawalManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const { data, isLoading, error } = useAllWithdrawals({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
    walletType: walletFilter !== "all" ? walletFilter : undefined,
  });

  const { data: statsData } = useWithdrawalStatistics();
  const approveWithdrawalMutation = useApproveWithdrawal();
  const rejectWithdrawalMutation = useRejectWithdrawal();

  const withdrawals = data?.withdrawals || [];
  const pagination = data?.pagination || {};
  const statistics = statsData || {};

  const handleApprove = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRemarks("");
    setTransactionId("");
    setApproveModal(true);
  };

  const handleReject = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRemarks("");
    setRejectModal(true);
  };

  const handleView = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setViewModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return;

    if (!transactionId) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter transaction ID",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      await approveWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        transactionId: transactionId,
        remarks: remarks || "Payment processed successfully",
      });

      notifications.show({
        title: "Success",
        message: "Withdrawal approved successfully",
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setApproveModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to approve withdrawal",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedWithdrawal) return;

    if (!remarks) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide rejection reason",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      await rejectWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        remarks,
      });

      notifications.show({
        title: "Success",
        message: "Withdrawal rejected",
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setRejectModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reject withdrawal",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: any = {
      pending: { color: "yellow", icon: <Clock size={12} /> },
      processing: { color: "blue", icon: <History size={12} /> },
      completed: { color: "green", icon: <CheckCircle size={12} /> },
      rejected: { color: "red", icon: <XCircle size={12} /> },
    };
    const config = configs[status] || { color: "gray", icon: <AlertCircle size={12} /> };
    return (
      <Badge color={config.color} variant="light" leftSection={config.icon} size="sm" radius="sm">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getWalletBadge = (walletType: string) => {
    return (
      <Badge color={walletType === "mainWallet" ? "blue.8" : "emerald.8"} variant="light" size="xs" radius="xs" fw={800}>
        {walletType === "mainWallet" ? "PRIME" : "TASK"}
      </Badge>
    );
  };

  const getAccountTypeBadge = (accountType: string) => {
    const configs: any = {
      savings: { color: "blue", icon: <CreditCard size={10} />, label: "Savings" },
      current: { color: "cyan", icon: <CreditCard size={10} />, label: "Current" },
      qr: { color: "violet", icon: <QrCode size={10} />, label: "UPI/QR" },
    };
    const config = configs[accountType] || { color: "gray", label: accountType };
    return (
      <Badge color={config.color} variant="outline" leftSection={config.icon} size="xs" radius="md">
        {config.label}
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
      <Alert icon={<AlertCircle size={18} />} title="System Error" color="red" radius="lg">
        Synchronisation error in financial ledger. Please contact security.
      </Alert>
    );
  }

  const rows = withdrawals.map((withdrawal: any) => (
    <Table.Tr key={withdrawal._id} style={{ transition: 'all 0.2s ease' }}>
      <Table.Td>
        <Box>
          <Text size="sm" fw={800} c="#2d3748">#{withdrawal._id.slice(-8).toUpperCase()}</Text>
          <Text size="10px" c="dimmed" fw={600}>
            {formatDate(withdrawal.createdAt)}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Box>
          <Text size="sm" fw={700} c="#1a202c">
            {withdrawal.userId?.name || "N/A"}
          </Text>
          <Text size="11px" c="dimmed" fw={600}>
            {withdrawal.userId?.phone || "N/A"}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={900} c="blue.8">
          ₹{withdrawal.amount?.toLocaleString()}
        </Text>
      </Table.Td>
      <Table.Td>{getWalletBadge(withdrawal.walletType)}</Table.Td>
      <Table.Td>
        <Box>
          <Text size="xs" fw={700}>{withdrawal.bankName}</Text>
          {withdrawal.accountType === 'qr' ? (
            <Badge size="xs" color="violet" variant="light">UPI/DIRECT</Badge>
          ) : (
            <Text size="10px" c="dimmed" fw={600}>
              ACC: ••••{withdrawal.accountNumber?.slice(-4)}
            </Text>
          )}
        </Box>
      </Table.Td>
      <Table.Td>{getAccountTypeBadge(withdrawal.accountType)}</Table.Td>
      <Table.Td>{getStatusBadge(withdrawal.status)}</Table.Td>
      <Table.Td>
        <Group gap={6} wrap="nowrap">
          <Tooltip label="Expand Ledger">
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
              <Tooltip label="Approve Request">
                <ActionIcon
                  variant="light"
                  color="#0f2027"
                  size="sm"
                  onClick={() => handleApprove(withdrawal)}
                  radius="md"
                >
                  <CheckCircle size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Reject Request">
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
          <Badge variant="light" color="blue" radius="sm" mb="xs">TREASURY MANAGEMENT v2.0</Badge>
          <Heading order={1} fw={900} style={{ letterSpacing: "-1px" }}>Financial Disbursement Console</Heading>
          <Text c="dimmed" size="sm" fw={500}>Monitor and authorize asset liquidations across the network repositories.</Text>
        </Box>

        {}
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <DollarSign size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="blue.2" size="sm">TOTAL VOLUME</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>₹{statistics.totalAmount?.toLocaleString() || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>AGGREGATE LIQUIDITY</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #b45309 0%, #92400e 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <Clock size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="orange.2" size="sm">WAITING</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>{statistics.pendingCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>PENDING AUTHORIZATIONS</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <ShieldCheck size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="emerald.2" size="sm">SUCCESS</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>{statistics.completedCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>PROCESSED TRANSFERS</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #9f1239 0%, #881337 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <TrendingDown size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="rose.2" size="sm">DENIED</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>{statistics.rejectedCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>REJECTED REQUESTS</Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        {}
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap="lg">
            <Group gap="md">
              <TextInput
                placeholder="Search by profile name, phone or unique request ID..."
                leftSection={<Search size={18} color="#666" />}
                size="md"
                radius="xl"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActivePage(1);
                }}
                style={{ flex: 1 }}
                styles={{ input: { background: '#f8f9fa', border: '1px solid #eee' } }}
              />
              <Select
                placeholder="Lifecycle Status"
                size="md"
                radius="xl"
                data={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Awaiting Review" },
                  { value: "processing", label: "In Transmission" },
                  { value: "completed", label: "Finalized" },
                  { value: "rejected", label: "Denied" },
                ]}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value || "all");
                  setActivePage(1);
                }}
                styles={{ input: { background: '#f8f9fa', border: '1px solid #eee' } }}
              />
              <Select
                placeholder="Source Repository"
                size="md"
                radius="xl"
                data={[
                  { value: "all", label: "All Wallets" },
                  { value: "mainWallet", label: "Prime Repository" },
                  { value: "commissionWallet", label: "Task Repository" },
                ]}
                value={walletFilter}
                onChange={(value) => {
                  setWalletFilter(value || "all");
                  setActivePage(1);
                }}
                styles={{ input: { background: '#f8f9fa', border: '1px solid #eee' } }}
              />
            </Group>

            <Table.ScrollContainer minWidth={1200}>
              <Table verticalSpacing="md" horizontalSpacing="md">
                <Table.Thead bg="#f8f9fa">
                  <Table.Tr>
                    <Table.Th style={{ borderRadius: '16px 0 0 0' }}>REQUISITION ID</Table.Th>
                    <Table.Th>INVESTOR</Table.Th>
                    <Table.Th>UNIT VALUE</Table.Th>
                    <Table.Th>REPOSITORY</Table.Th>
                    <Table.Th>SETTLEMENT TARGET</Table.Th>
                    <Table.Th>FLOW TYPE</Table.Th>
                    <Table.Th>LIFECYCLE</Table.Th>
                    <Table.Th style={{ borderRadius: '0 16px 0 0' }}>OPS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoading ? (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <Loader size="lg" color="blue" />
                          <Text c="dimmed" mt="md" fw={700}>Synchronizing Fiscal Records...</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  ) : rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <ThemeIcon size={64} radius="xl" variant="light" color="gray"><Search size={32} /></ThemeIcon>
                          <Text c="dimmed" mt="md" fw={700}>No reconciliation entries found.</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Flex justify="space-between" align="center" mt="xl" px="md">
              <Text size="sm" c="dimmed" fw={600}>
                Page <Text span fw={800} c="blue.9">{activePage}</Text> of <Text span fw={800}>{pagination.totalPages || 1}</Text>
              </Text>
              <Pagination
                total={pagination.totalPages || 1}
                value={activePage}
                onChange={setActivePage}
                radius="xl"
                color="blue"
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
        title={<Text fw={900} size="xl">Transaction Protocol: Authorization</Text>}
        centered
        size="lg"
        radius="28px"
        padding="xl"
      >
        {selectedWithdrawal && (
          <Stack gap="lg">
            <Stack gap="md">
              <Paper p="md" radius="lg" bg="emerald.0" style={{ border: '1px solid #c6f6d5' }}>
                <Flex gap="sm">
                  <CheckCircle color="#38a169" />
                  <Box>
                    <Text size="sm" fw={800} c="emerald.9">STANDARD SETTLEMENT PROTOCOL</Text>
                    <Text size="xs" fw={600} c="emerald.8">Verify external payment before committing ledger update.</Text>
                  </Box>
                </Flex>
              </Paper>

              {selectedWithdrawal.accountType === 'qr' && selectedWithdrawal.qrCodeImage && (
                <Paper p="md" radius="xl" withBorder style={{ textAlign: 'center' }}>
                  <Text size="xs" fw={800} mb="sm" c="dimmed">UPI SCANNER ACTIVE</Text>
                  <Image
                    src={`${import.meta.env.VITE_PUBLIC_BASE_URL}/${selectedWithdrawal.qrCodeImage}`}
                    width={220}
                    mx="auto"
                    radius="md"
                  />
                  <Text size="10px" c="dimmed" mt="sm">Scan to execute instant settlement</Text>
                </Paper>
              )}

              <Card withBorder radius="xl" p="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={800}>HOLDER</Text>
                    <Text size="xs" fw={800}>{selectedWithdrawal.accountHolderName}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={800}>INSTITUTION</Text>
                    <Text size="xs" fw={800}>{selectedWithdrawal.bankName}</Text>
                  </Group>
                  {selectedWithdrawal.accountType !== 'qr' && (
                    <>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={800}>ACCOUNT</Text>
                        <Group gap={4}>
                          <Text size="xs" fw={900}>{selectedWithdrawal.accountNumber}</Text>
                          <CopyButton value={selectedWithdrawal.accountNumber}>
                            {({ copied, copy }) => (
                              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy} size="xs" variant="subtle"><Copy size={10} /></ActionIcon>
                            )}
                          </CopyButton>
                        </Group>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={800}>ROUTING (IFSC)</Text>
                        <Group gap={4}>
                          <Text size="xs" fw={900}>{selectedWithdrawal.ifscCode}</Text>
                          <CopyButton value={selectedWithdrawal.ifscCode}>
                            {({ copied, copy }) => (
                              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy} size="xs" variant="subtle"><Copy size={10} /></ActionIcon>
                            )}
                          </CopyButton>
                        </Group>
                      </Group>
                    </>
                  )}
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" fw={900}>SETTLEMENT AMOUNT</Text>
                    <Text size="sm" fw={900} c="blue.9">₹{selectedWithdrawal.amount?.toLocaleString()}</Text>
                  </Group>
                </Stack>
              </Card>

              <TextInput
                label="EXTERNAL TRANSACTION TRACE ID"
                placeholder="e.g., UTR-19283746..."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                radius="md"
                leftSection={<ExternalLink size={16} />}
              />

              <Textarea
                label="REMARKS"
                placeholder="Optional audit notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                radius="md"
              />
            </Stack>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={() => setApproveModal(false)}>Discard</Button>
              <Button
               color="#0f2027"
                onClick={confirmApprove}
                loading={approveWithdrawalMutation.isPending}
                leftSection={<Save size={16} />}
                radius="xl"
                size="md"
              >
                Commit Authorisation
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={rejectModal}
        onClose={() => setRejectModal(false)}
        title={<Text fw={900} size="xl">Risk Mitigation: Request Denial</Text>}
        centered
        radius="28px"
        padding="xl"
      >
        {selectedWithdrawal && (
          <Stack gap="lg">
            <Paper p="md" radius="lg" bg="red.0" style={{ border: '1px solid #fed7d7' }}>
              <Flex gap="sm">
                <ShieldAlert color="#e53e3e" />
                <Box>
                  <Text size="sm" fw={800} c="red.9">DENIAL PROTOCOL INITIATED</Text>
                  <Text size="xs" fw={600} c="red.8">Assets will be reversed to the user's source repository.</Text>
                </Box>
              </Flex>
            </Paper>

            <Card withBorder radius="xl" p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed" fw={800}>TARGET VALUE</Text>
                  <Text size="sm" fw={900}>₹{selectedWithdrawal.amount?.toLocaleString()}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed" fw={800}>PROFILE</Text>
                  <Text size="sm" fw={700}>{selectedWithdrawal.userId?.name}</Text>
                </Group>
              </Stack>
            </Card>

            <Textarea
              label="REJECTION JUSTIFICATION"
              placeholder="Explain why this request was denied..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              minRows={4}
              radius="md"
            />

            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={() => setRejectModal(false)}>Cancel</Button>
              <Button
                color="red"
                onClick={confirmReject}
                loading={rejectWithdrawalMutation.isPending}
                leftSection={<XCircle size={16} />}
                radius="xl"
              >
                Execute Denial
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title={<Text fw={900} size="xl">Asset Requisition Details</Text>}
        size="lg"
        radius="28px"
        padding="xl"
      >
        {selectedWithdrawal && (
          <Stack gap="xl">
            <Paper p="lg" radius="xl" withBorder bg="gray.1">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>UNIQUE LEDGER ID</Text>
                  <Text fw={900}>{selectedWithdrawal._id}</Text>
                </Box>
                <Badge size="lg" radius="sm" color="blue" variant="filled">
                  {selectedWithdrawal.status?.toUpperCase()}
                </Badge>
              </Group>
            </Paper>

            <SimpleGrid cols={2} spacing="lg">
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>INVESTOR RELATION</Text>
                <Text size="sm" fw={700}>{selectedWithdrawal.userId?.name}</Text>
                <Text size="xs" c="dimmed">{selectedWithdrawal.userId?.phone}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>FISCAL COORDINATES</Text>
                <Text size="sm" fw={700}>₹{selectedWithdrawal.amount?.toLocaleString()}</Text>
                <Text size="xs" c="dimmed">{selectedWithdrawal.walletType === "mainWallet" ? "Prime Repository" : "Task Repository"}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>SETTLEMENT TARGET</Text>
                <Text size="sm" fw={700}>{selectedWithdrawal.bankName}</Text>
                <Text size="xs" c="dimmed">{selectedWithdrawal.accountNumber}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>TEMPORAL STAMP</Text>
                <Text size="sm" fw={700}>{formatDate(selectedWithdrawal.createdAt)}</Text>
              </Box>
            </SimpleGrid>

            <Divider label="Audit Trail" labelPosition="center" />

            {selectedWithdrawal.transactionId && (
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>TRACE ID</Text>
                <Paper p="xs" radius="md" bg="gray.1" style={{ fontFamily: 'monospace' }}>
                  <Text size="sm" fw={700}>{selectedWithdrawal.transactionId}</Text>
                </Paper>
              </Box>
            )}

            {selectedWithdrawal.remarks && (
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>SYSTEM REMARKS</Text>
                <Text size="sm" fs="italic" c="gray.7">"{selectedWithdrawal.remarks}"</Text>
              </Box>
            )}

            <Group justify="flex-end">
              <Button variant="light" color="blue" radius="xl" onClick={() => setViewModal(false)}>Close Ledger</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default WithdrawalManagement;