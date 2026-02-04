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
  Image,
  Textarea,
  Stack,
  Title,
  Box,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Card,
} from "@mantine/core";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Eye,
  Zap,
  History,
  AlertTriangle,
  Download,
  Info,
  Check,
  Save,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import {
  useAllRecharges,
  useApproveRecharge,
  useRejectRecharge,
  useRechargeStatistics,
} from "../../hooks/query/Recharges.query";
import classes from "./index.module.scss";
import Heading from "../../@ui/common/Heading";

const RechargeManagement = () => {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("processing"); 
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedRecharge, setSelectedRecharge] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  
  const { data, isLoading, error } = useAllRecharges({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  
  const { data: statsData } = useRechargeStatistics();

  
  const approveRechargeMutation = useApproveRecharge();
  const rejectRechargeMutation = useRejectRecharge();

  const recharges = data?.recharges || [];
  const pagination = data?.pagination || {};
  const statistics = statsData || {};

  
  const handleApprove = (recharge: any) => {
    setSelectedRecharge(recharge);
    setRemarks("Payment verified and approved");
    setApproveModal(true);
  };

  const handleReject = (recharge: any) => {
    setSelectedRecharge(recharge);
    setRemarks("");
    setRejectModal(true);
  };

  const handleView = (recharge: any) => {
    setSelectedRecharge(recharge);
    setViewModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRecharge) return;

    try {
      await approveRechargeMutation.mutateAsync({
        orderId: selectedRecharge.orderId,
        remarks: remarks || "Payment verified and approved by admin",
      });

      notifications.show({
        title: "✅ Recharge Approved",
        message: `₹${selectedRecharge.amount} added to user's wallet successfully`,
        color: "green",
        icon: <CheckCircle size={18} />,
        autoClose: 5000,
      });

      setApproveModal(false);
      setRemarks("");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to approve recharge",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedRecharge) return;

    if (!remarks || remarks.trim().length < 10) {
      notifications.show({
        title: "Validation Error",
        message:
          "Please provide a detailed rejection reason (minimum 10 characters)",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      await rejectRechargeMutation.mutateAsync({
        orderId: selectedRecharge.orderId,
        remarks: remarks.trim(),
      });

      notifications.show({
        title: "Recharge Rejected",
        message: "Recharge request has been rejected",
        color: "orange",
        icon: <AlertTriangle size={18} />,
      });

      setRejectModal(false);
      setRemarks("");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reject recharge",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { color: "yellow", label: "PENDING", icon: <Clock size={12} /> },
      processing: { color: "blue", label: "PROCESSING", icon: <History size={12} /> },
      completed: { color: "green", label: "COMPLETED", icon: <CheckCircle size={12} /> },
      rejected: { color: "red", label: "REJECTED", icon: <XCircle size={12} /> },
    };

    const config = statusConfig[status] || {
      color: "gray",
      label: status.toUpperCase(),
      icon: <Info size={12} />,
    };

    return (
      <Badge color={config.color} size="sm" variant="light" leftSection={config.icon} radius="sm">
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
      <Alert icon={<AlertCircle size={18} />} title="Critical Error" color="red" radius="lg">
        Synchronisation error in revenue streams. Please contact support.
      </Alert>
    );
  }

  const rows = recharges.map((recharge: any) => (
    <Table.Tr key={recharge._id} style={{ transition: 'all 0.2s ease' }}>
      <Table.Td>
        <Box>
          <Text size="sm" fw={800} c="#2d3748">#{recharge.orderId?.toUpperCase()}</Text>
          <Text size="10px" c="dimmed" fw={600}>
            {formatDate(recharge.createdAt)}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Box>
          <Text size="sm" fw={700} c="#1a202c">
            {recharge.userId?.name || "N/A"}
          </Text>
          <Text size="11px" c="dimmed" fw={600}>
            {recharge.userId?.phone || "N/A"}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={900} c="blue.8">
          ₹{recharge.amount?.toLocaleString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Box>
          <Text size="xs" fw={700}>{recharge.paymentDetails?.methodName || "N/A"}</Text>
          <Badge size="xs" variant="light" color="indigo" radius="xs" fw={800}>
            {recharge.paymentDetails?.methodType?.toUpperCase() || "DIRECT"}
          </Badge>
        </Box>
      </Table.Td>
      <Table.Td>
        <Tooltip label={recharge.transactionId || "Pending Verification"}>
          <Text size="xs" c="dimmed" fw={600} style={{ fontFamily: 'monospace' }}>
            {recharge.transactionId ? recharge.transactionId.slice(0, 12) + "..." : "Pending"}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>{getStatusBadge(recharge.status)}</Table.Td>
      <Table.Td>
        <Group gap={6} wrap="nowrap">
          <Tooltip label="Examine Proof">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleView(recharge)}
              radius="md"
            >
              <Eye size={14} />
            </ActionIcon>
          </Tooltip>
          {recharge.status === "processing" && (
            <>
              <Tooltip label="Authorize Funds">
                <ActionIcon
                  variant="light"
                  color="emerald"
                  size="sm"
                  onClick={() => handleApprove(recharge)}
                  radius="md"
                >
                  <CheckCircle size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Void Request">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleReject(recharge)}
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
          <Badge variant="light" color="blue" radius="sm" mb="xs">REVENUE GOVERNANCE v2.0</Badge>
          <Heading order={1} fw={900} style={{ letterSpacing: "-1px" }}>Asset Ingress Dashboard</Heading>
          <Text c="dimmed" size="sm" fw={500}>Verify and authorize fresh capital injections across investor nodes.</Text>
        </Box>

        {}
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <DollarSign size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="blue.2" size="sm">TOTAL INGRESS</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>₹{statistics.totalAmount?.toLocaleString() || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>LIFETIME REVENUE</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #0369a1 0%, #075985 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <Clock size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="sky.2" size="sm">ACTIVE</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>{statistics.processingCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>PENDING VERIFICATIONS</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #047857 0%, #065f46 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <CheckCircle size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="emerald.2" size="sm">RECONCILED</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>{statistics.completedCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>SUCCESSFUL DEPOSITS</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #be123c 0%, #9f1239 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <AlertTriangle size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="rose.2" size="sm">CANCELLED</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="20px" fw={900}>{statistics.rejectedCount || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>FAILED ATTEMPTS</Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        {}
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap="lg">
            <Group gap="md">
              <TextInput
                placeholder="Search by order ID, name, phone, or bank UTR..."
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
                placeholder="Audit Status"
                size="md"
                radius="xl"
                data={[
                  { value: "all", label: "All Records" },
                  { value: "pending", label: "Initial Entry" },
                  { value: "processing", label: "Under Audit" },
                  { value: "completed", label: "Synchronized" },
                  { value: "rejected", label: "Voided" },
                ]}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value || "processing");
                  setActivePage(1);
                }}
                styles={{ input: { background: '#f8f9fa', border: '1px solid #eee' } }}
              />
            </Group>

            <Table.ScrollContainer minWidth={1200}>
              <Table verticalSpacing="md" horizontalSpacing="md">
                <Table.Thead bg="#f8f9fa">
                  <Table.Tr>
                    <Table.Th style={{ borderRadius: '16px 0 0 0' }}>ORDER REFERENCE</Table.Th>
                    <Table.Th>INVESTOR</Table.Th>
                    <Table.Th>ASSET VALUE</Table.Th>
                    <Table.Th>INGRESS METHOD</Table.Th>
                    <Table.Th>BANK TRACE ID</Table.Th>
                    <Table.Th>LEDGER STATUS</Table.Th>
                    <Table.Th style={{ borderRadius: '0 16px 0 0' }}>OPS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoading ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <Loader size="lg" color="blue" />
                          <Text c="dimmed" mt="md" fw={700}>Auditing Financial Streams...</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  ) : rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <ThemeIcon size={64} radius="xl" variant="light" color="gray"><Search size={32} /></ThemeIcon>
                          <Text c="dimmed" mt="md" fw={700}>No capital injections found.</Text>
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
        title={<Text fw={900} size="xl">Treasury Protocol: Authorize Ingress</Text>}
        centered
        radius="28px"
        padding="xl"
      >
        {selectedRecharge && (
          <Stack gap="lg">
            <Paper p="md" radius="lg" bg="emerald.0" style={{ border: '1px solid #c6f6d5' }}>
              <Flex gap="sm">
                <Check color="#38a169" />
                <Box>
                  <Text size="sm" fw={800} c="emerald.9">COMPLIANCE VERIFICATION</Text>
                  <Text size="xs" fw={600} c="emerald.8">Authorization will instantly credit units to the investor's prime repository.</Text>
                </Box>
              </Flex>
            </Paper>

            <Card withBorder radius="xl" p="xl">
              <Flex justify="space-between" align="center">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>INGRESS VALUE</Text>
                  <Title order={2} fw={900} c="blue.9">₹{selectedRecharge.amount?.toLocaleString()}</Title>
                </Box>
                <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                  <Zap size={32} />
                </ThemeIcon>
              </Flex>
              <Divider my="lg" />
              <SimpleGrid cols={2} spacing="sm">
                <Box>
                  <Text size="10px" c="dimmed" fw={800}>ORDER ID</Text>
                  <Text size="sm" fw={700}>#{selectedRecharge.orderId}</Text>
                </Box>
                <Box>
                  <Text size="10px" c="dimmed" fw={800}>TRACE ID</Text>
                  <Text size="sm" fw={700}>{selectedRecharge.transactionId || "N/A"}</Text>
                </Box>
              </SimpleGrid>
            </Card>

            <Textarea
              label="INTERNAL AUDIT REMARKS"
              placeholder="Verified via bank settlement statement..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              radius="md"
              minRows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={() => setApproveModal(false)}>Discard</Button>
              <Button
                color="emerald"
                onClick={confirmApprove}
                loading={approveRechargeMutation.isPending}
                leftSection={<Save size={16} />}
                radius="xl"
                size="md"
              >
                Execute Credit
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={rejectModal}
        onClose={() => setRejectModal(false)}
        title={<Text fw={900} size="xl">Risk Mitigation: Void Request</Text>}
        centered
        radius="28px"
        padding="xl"
      >
        {selectedRecharge && (
          <Stack gap="lg">
            <Paper p="md" radius="lg" bg="red.0" style={{ border: '1px solid #fed7d7' }}>
              <Flex gap="sm">
                <AlertTriangle color="#e53e3e" />
                <Box>
                  <Text size="sm" fw={800} c="red.9">VOID PROTOCOL INITIATED</Text>
                  <Text size="xs" fw={600} c="red.8">Request will be permanently voided. No credits will be issued.</Text>
                </Box>
              </Flex>
            </Paper>

            <Card withBorder radius="xl" p="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>AMOUNT</Text>
                  <Text size="sm" fw={900}>₹{selectedRecharge.amount?.toLocaleString()}</Text>
                </Box>
                <Box ta="right">
                  <Text size="xs" c="dimmed" fw={800}>HOLDER</Text>
                  <Text size="sm" fw={700}>{selectedRecharge.userId?.name}</Text>
                </Box>
              </Group>
            </Card>

            <Textarea
              label="REJECTION JUSTIFICATION (MIN 10 CHARS)"
              placeholder="e.g., Fragmented UTR code, Funds not settled..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              minRows={4}
              radius="md"
              error={remarks && remarks.length < 10 ? "Insufficient detail for rejection audit." : null}
            />

            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={() => setRejectModal(false)}>Cancel</Button>
              <Button
                color="red"
                onClick={confirmReject}
                loading={rejectRechargeMutation.isPending}
                leftSection={<XCircle size={16} />}
                radius="xl"
                disabled={!remarks || remarks.length < 10}
              >
                Void Transaction
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title={<Text fw={900} size="xl">Capital Ingress Audit Record</Text>}
        size="lg"
        radius="28px"
        padding="xl"
      >
        {selectedRecharge && (
          <Stack gap="xl">
            <Paper p="lg" radius="xl" withBorder bg="gray.1">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" fw={800}>LEDGER ORDER ID</Text>
                  <Text fw={900}>#{selectedRecharge.orderId}</Text>
                </Box>
                <Badge size="lg" radius="sm" color="blue" variant="filled">
                  {selectedRecharge.status?.toUpperCase()}
                </Badge>
              </Group>
            </Paper>

            <SimpleGrid cols={2} spacing="lg">
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>INVESTOR RELATION</Text>
                <Text size="sm" fw={700}>{selectedRecharge.userId?.name || "N/A"}</Text>
                <Text size="xs" c="dimmed">{selectedRecharge.userId?.phone || "N/A"}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>FISCAL COORDINATES</Text>
                <Text size="sm" fw={900} c="blue.8">₹{selectedRecharge.amount?.toLocaleString()}</Text>
                <Text size="xs" c="dimmed">Method: {selectedRecharge.paymentDetails?.methodName}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>SYSTEM TRACE ID (UTR)</Text>
                <Paper p="xs" radius="md" bg="blue.0" style={{ border: '1px dashed #3182ce' }}>
                  <Text size="xs" fw={900} ta="center">{selectedRecharge.transactionId || "AWAITING SUBMISSION"}</Text>
                </Paper>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>TEMPORARY STAMP</Text>
                <Text size="sm" fw={700}>{formatDate(selectedRecharge.createdAt)}</Text>
                {selectedRecharge.submittedAt && (
                  <Text size="10px" c="green.7" fw={600}>Submitted: {formatDate(selectedRecharge.submittedAt)}</Text>
                )}
              </Box>
            </SimpleGrid>

            <Divider label="Institutional Evidence" labelPosition="center" />

            {selectedRecharge.paymentImage && (
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={8}>PAYOR TRANSACTION PROOF</Text>
                <Box style={{ background: '#f8f9fa', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }} p="md">
                  <Image
                    src={`${import.meta.env.VITE_PUBLIC_BASE_URL}/${selectedRecharge.paymentImage}`}
                    radius="md"
                    mx="auto"
                    alt="Bank Transfer Proof"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                  <Flex justify="center" mt="sm">
                    <Button variant="subtle" component="a" href={`${import.meta.env.VITE_PUBLIC_BASE_URL}/${selectedRecharge.paymentImage}`} target="_blank" leftSection={<Download size={14} />} size="xs">Download Original Proof</Button>
                  </Flex>
                </Box>
              </Box>
            )}

            {selectedRecharge.remarks && (
              <Box>
                <Text size="xs" c="dimmed" fw={800} mb={4}>AUDITOR MEMO</Text>
                <Paper p="md" radius="md" bg="gray.0" withBorder>
                  <Text size="sm" fs="italic" c="gray.7">"{selectedRecharge.remarks}"</Text>
                </Paper>
              </Box>
            )}

            <Group justify="flex-end">
              <Button variant="light" color="blue" radius="xl" onClick={() => setViewModal(false)}>Close Audit</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default RechargeManagement;
