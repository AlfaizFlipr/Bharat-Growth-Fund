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
  PasswordInput,
  Avatar,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  NumberInput,
  Switch,
  SimpleGrid,
  Stack,
  ThemeIcon,
  Title,
  Box,
} from "@mantine/core";
import {
  Search,
  Key,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  AlertCircle,
  Users,
  TrendingUp,
  Minus,
  Plus,
  UserCheck,
  Lock,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import { notifications } from "@mantine/notifications";
import {
  useAllUsers,
  useResetPassword,
  useUpdateVerification,
  useUpdateAadhaar,
  useToggleStatus,
  useAddWalletAmount,
  useDeductWalletAmount,
} from "../../hooks/query/useAdminUsers.query";
import { useToggleUSDUser } from "../../hooks/query/USDWithdrawal.query";
import classes from "./index.module.scss";
import Heading from "../../@ui/common/Heading";

const AllUsers = () => {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [levelFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [aadhaarModal, setAadhaarModal] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  
  const [walletModal, setWalletModal] = useState(false);
  const [walletAction, setWalletAction] = useState<"add" | "deduct">("add");
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [deductReason, setDeductReason] = useState("");

  
  const { data, isLoading, error } = useAllUsers({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    verificationStatus: verificationFilter,
    userLevel: levelFilter,
    sortBy: "createdAt",
    sortOrder: "desc",
  });


  
  const resetPasswordMutation = useResetPassword();
  const updateVerificationMutation = useUpdateVerification();
  const updateAadhaarMutation = useUpdateAadhaar();
  const toggleStatusMutation = useToggleStatus();
  const addWalletAmountMutation = useAddWalletAmount();
  const deductWalletAmountMutation = useDeductWalletAmount();
  const toggleUSDUserMutation = useToggleUSDUser();

  const users = data?.users || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  
  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setResetPasswordModal(true);
    setNewPassword("");
  };

  const handleWalletAction = (user: any, action: "add" | "deduct") => {
    setSelectedUser(user);
    setWalletAction(action);
    setWalletModal(true);
    setWalletAmount(0);
    setDeductReason("");
  };

  const confirmWalletAction = async () => {
    if (!walletAmount || walletAmount <= 0) {
      notifications.show({
        title: "Invalid Amount",
        message: "Amount must be greater than 0",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    if (walletAction === "deduct" && !deductReason.trim()) {
      notifications.show({
        title: "Reason Required",
        message: "Please provide a reason for deduction",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      if (walletAction === "add") {
        await addWalletAmountMutation.mutateAsync({
          userId: selectedUser._id,
          walletType: "mainWallet",
          amount: walletAmount,
        });

        notifications.show({
          title: "Success",
          message: `₹${walletAmount} added to ${selectedUser.name}'s Prime Wallet`,
          color: "green",
          icon: <CheckCircle size={18} />,
        });
      } else {
        await deductWalletAmountMutation.mutateAsync({
          userId: selectedUser._id,
          walletType: "mainWallet",
          amount: walletAmount,
          reason: deductReason,
        });

        notifications.show({
          title: "Success",
          message: `₹${walletAmount} deducted from ${selectedUser.name}'s Prime Wallet`,
          color: "green",
          icon: <CheckCircle size={18} />,
        });
      }

      setWalletModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || `Failed to ${walletAction} amount`,
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const confirmResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      notifications.show({
        title: "Invalid Password",
        message: "Password must be at least 6 characters",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        userId: selectedUser._id,
        newPassword,
      });

      notifications.show({
        title: "Success",
        message: `Password reset successful for ${selectedUser.name}`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setResetPasswordModal(false);
      setNewPassword("");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reset password",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const handleVerificationToggle = async (user: any) => {
    try {
      await updateVerificationMutation.mutateAsync({
        userId: user._id,
        isVerified: !user.isVerified,
      });

      notifications.show({
        title: "Success",
        message: `User verification ${!user.isVerified ? "enabled" : "disabled"}`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update verification status",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const handleAadhaarVerification = (user: any) => {
    setSelectedUser(user);
    setAadhaarModal(true);
    setAadhaarStatus("");
    setRejectionReason("");
  };

  const confirmAadhaarVerification = async () => {
    if (!aadhaarStatus) {
      notifications.show({
        title: "Invalid Selection",
        message: "Please select a verification status",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    if (aadhaarStatus === "rejected" && !rejectionReason) {
      notifications.show({
        title: "Rejection Reason Required",
        message: "Please provide a reason for rejection",
        color: "red",
        icon: <XCircle size={18} />,
      });
      return;
    }

    try {
      await updateAadhaarMutation.mutateAsync({
        userId: selectedUser._id,
        status: aadhaarStatus as any,
        rejectionReason: aadhaarStatus === "rejected" ? rejectionReason : undefined,
      });

      notifications.show({
        title: "Success",
        message: `Aadhaar verification ${aadhaarStatus}`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setAadhaarModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update Aadhaar verification",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await toggleStatusMutation.mutateAsync({
        userId: user._id,
        isActive: !user.isActive,
      });

      notifications.show({
        title: "Success",
        message: `User ${!user.isActive ? "activated" : "deactivated"}`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update user status",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const handleToggleUSDUser = async (user: any) => {
    try {
      await toggleUSDUserMutation.mutateAsync({
        userId: user._id,
        isUSDUser: !user.isUSDUser,
      });

      notifications.show({
        title: "Success",
        message: `User ${!user.isUSDUser ? "enabled" : "disabled"} for USD withdrawals`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to update USD status",
        color: "red",
        icon: <XCircle size={18} />,
      });
    }
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig: any = {
      approved: { color: "green", label: "Approved", icon: <CheckCircle size={12} /> },
      pending: { color: "yellow", label: "Pending", icon: <Filter size={12} /> },
      rejected: { color: "red", label: "Rejected", icon: <XCircle size={12} /> },
      not_submitted: { color: "gray", label: "Not Submitted", icon: <AlertCircle size={12} /> },
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <Badge color={config.color} variant="light" leftSection={config.icon} size="sm" radius="sm">
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert icon={<AlertCircle size={18} />} title="System Error" color="red" radius="lg">
        Critical error synchronizing user repository. Please restart nodes.
      </Alert>
    );
  }

  const rows = users.map((user: any) => (
    <Table.Tr key={user._id} style={{ transition: 'all 0.2s ease' }}>
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar src={user.picture} radius="xl" size="40px" style={{ border: '2px solid #edf2f7' }}>
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ overflow: 'hidden' }}>
            <Text size="sm" fw={800} truncate c="#2d3748">
              {user.name}
            </Text>
            <Text size="11px" c="dimmed" fw={600}>
              {user.phone}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue" radius="xs" size="sm" fw={800}>
          {user.levelName || "N/A"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Toggle User Verification" position="top">
          <Badge
            color={user.isVerified ? "teal" : "red"}
            variant="filled"
            style={{ cursor: "pointer", height: 24 }}
            onClick={() => handleVerificationToggle(user)}
            size="sm"
          >
            {user.isVerified ? "VERIFIED" : "PENDING"}
          </Badge>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Click to manage Aadhaar verification" position="top">
          <div style={{ cursor: "pointer" }} onClick={() => handleAadhaarVerification(user)}>
            {getVerificationBadge(user.aadhaarVerificationStatus)}
          </div>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={800} c="#1a202c">₹{user.mainWallet?.toLocaleString() || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label={user.plainPassword || "N/A"}>
          <Text size="xs" c="dimmed" style={{ cursor: "pointer", fontFamily: 'monospace' }} fw={600}>
            {user.plainPassword ? "••••••" : "N/A"}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Switch
          checked={user.isActive || false}
          onChange={() => handleToggleStatus(user)}
          size="xs"
          color="teal"
          styles={{ thumb: { border: '1px solid #ccc' } }}
        />
      </Table.Td>
      <Table.Td>
        <Tooltip label={user.isUSDUser ? "Disable USD Withdrawals" : "Enable USD Withdrawals"} position="top">
          <Switch
            checked={user.isUSDUser || false}
            onChange={() => handleToggleUSDUser(user)}
            size="xs"
            color="indigo"
            thumbIcon={user.isUSDUser ? <DollarSign size={10} /> : null}
            styles={{ thumb: { border: '1px solid #ccc' } }}
          />
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Group gap={6} wrap="nowrap">
          <ActionIcon variant="light" color="blue" size="sm" radius="md">
            <Eye size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="emerald"
            size="sm"
            onClick={() => handleWalletAction(user, "add")}
            radius="md"
          >
            <Plus size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            size="sm"
            onClick={() => handleWalletAction(user, "deduct")}
            radius="md"
          >
            <Minus size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="orange"
            size="sm"
            onClick={() => handleResetPassword(user)}
            radius="md"
          >
            <Key size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="xl" className={classes.container} bg="#fdfdfd" style={{ minHeight: '100vh' }}>
      <Stack gap="xl">
        <Box>
          <Badge variant="light" color="blue" radius="sm" mb="xs">USER REPOSITORY v2.0</Badge>
          <Heading order={1} fw={900} style={{ letterSpacing: "-1px" }}>Universal Asset Management</Heading>
          <Text c="dimmed" size="sm" fw={500}>Monitor and regulate all investor profiles across the Bharat Growth Fund network.</Text>
        </Box>

        {}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <Users size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="blue.2" size="sm">TOTAL USERS</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="22px" fw={900}>{statistics.totalUsers?.toLocaleString() || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>ACCREDITED INVESTORS</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <UserCheck size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="emerald.2" size="sm">VERIFICATION</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="22px" fw={900}>{statistics.verifiedUsers?.toLocaleString() || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>KYC COMPLIANT USERS</Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)", color: 'white', border: 'none' }}>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                <TrendingUp size={22} color="#fff" />
              </ThemeIcon>
              <Badge variant="dot" color="indigo.2" size="sm">ENGAGEMENT</Badge>
            </Group>
            <Stack gap={0} mt="md">
              <Text size="22px" fw={900}>{statistics.activeUsers?.toLocaleString() || 0}</Text>
              <Text size="10px" fw={700} opacity={0.6}>REAL-TIME ACTIVE STATUS</Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        {}
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap="lg">
            <Group gap="md">
              <TextInput
                placeholder="Search profiles by name, phone or unique ID..."
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
                placeholder="Filter by KYC"
                size="md"
                radius="xl"
                data={[
                  { value: "all", label: "All Verifications" },
                  { value: "verified", label: "KYC Verified" },
                  { value: "unverified", label: "Pending KYC" },
                ]}
                value={verificationFilter}
                onChange={(value) => {
                  setVerificationFilter(value || "all");
                  setActivePage(1);
                }}
                styles={{ input: { background: '#f8f9fa', border: '1px solid #eee' } }}
              />
            </Group>

            <Table.ScrollContainer minWidth={1100}>
              <Table verticalSpacing="md" horizontalSpacing="md">
                <Table.Thead bg="#f8f9fa">
                  <Table.Tr>
                    <Table.Th style={{ borderRadius: '16px 0 0 0' }}>USER</Table.Th>
                    <Table.Th>TIER</Table.Th>
                    <Table.Th>VERIFIED</Table.Th>
                    <Table.Th>KYC STATUS</Table.Th>
                    <Table.Th>WALLET</Table.Th>
                    <Table.Th>PASSWORD</Table.Th>
                    <Table.Th>STATUS</Table.Th>
                    <Table.Th>USD USER</Table.Th>
                    <Table.Th style={{ borderRadius: '0 16px 0 0' }}>ACTIONS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoading ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <Loader size="lg" color="blue" />
                          <Text c="dimmed" mt="md" fw={700}>Loading Users...</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  ) : users.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <Flex justify="center" direction="column" align="center" py={100}>
                          <ThemeIcon size={64} radius="xl" variant="light" color="gray"><Search size={32} /></ThemeIcon>
                          <Text c="dimmed" mt="md" fw={700}>No users found.</Text>
                        </Flex>
                      </Table.Td>
                    </Table.Tr>
                  ) : rows}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Flex justify="space-between" align="center" mt="xl" px="md">
              <Text size="sm" c="dimmed" fw={600}>
                Showing <Text span fw={800} c="blue.9">{users.length}</Text> users in the current view
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
        opened={resetPasswordModal}
        onClose={() => setResetPasswordModal(false)}
        title={<Text fw={900} size="xl">Security Protocol: Password Reset</Text>}
        centered
        radius="lg"
        padding="xl"
      >
        {selectedUser && (
          <Stack gap="md">
            <Paper p="md" radius="md" bg="orange.0" style={{ border: '1px solid #feebc8' }}>
              <Flex gap="sm">
                <ShieldAlert color="#dd6b20" />
                <Box>
                  <Text size="sm" fw={800} c="orange.9">AUTH OVERRIDE REQUESTED</Text>
                  <Text size="xs" fw={600} c="orange.8">Profile: {selectedUser.name} ({selectedUser.phone})</Text>
                </Box>
              </Flex>
            </Paper>

            <PasswordInput
              label="New Security PIN"
              placeholder="Enter minimum 6 characters"
              leftSection={<Lock size={16} />}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              size="md"
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setResetPasswordModal(false)}>Cancel</Button>
              <Button color="orange" onClick={confirmResetPassword} loading={resetPasswordMutation.isPending}>Reset</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {}
      <Modal
        opened={walletModal}
        onClose={() => setWalletModal(false)}
        title={<Text fw={900} size="xl">{walletAction === 'add' ? 'Credit Wallet' : 'Debit Wallet'}</Text>}
        centered
        radius="lg"
      >
        <Stack>
          <NumberInput
            label="Amount (₹)"
            placeholder="0.00"
            leftSection="₹"
            value={walletAmount}
            onChange={(val) => setWalletAmount(Number(val))}
            min={0}
          />
          {walletAction === 'deduct' && (
            <TextInput
              label="Reason"
              placeholder="Reason for deduction"
              value={deductReason}
              onChange={(e) => setDeductReason(e.target.value)}
            />
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setWalletModal(false)}>Cancel</Button>
            <Button color={walletAction === 'add' ? 'green' : 'red'} onClick={confirmWalletAction} loading={walletAction === 'add' ? addWalletAmountMutation.isPending : deductWalletAmountMutation.isPending}>
              {walletAction === 'add' ? 'Credit' : 'Debit'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {}
      <Modal
        opened={aadhaarModal}
        onClose={() => setAadhaarModal(false)}
        title="Aadhaar Verification"
        centered
        radius="lg"
      >
        <Stack>
          <Select
            label="Status"
            data={[
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'pending', label: 'Pending' }
            ]}
            value={aadhaarStatus}
            onChange={(val) => setAadhaarStatus(val || '')}
          />
          {aadhaarStatus === 'rejected' && (
            <TextInput
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}
          <Button onClick={confirmAadhaarVerification} loading={updateAadhaarMutation.isPending}>Update Status</Button>
        </Stack>
      </Modal>

    </Box>
  );
};

export default AllUsers;