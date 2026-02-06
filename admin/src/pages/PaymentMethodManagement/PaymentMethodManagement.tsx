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
  Switch,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiAlertCircle,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllPaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from "../../hooks/query/Payment.query";
import classes from "./index.module.scss";
import Heading from '../../@ui/common/Heading';

interface PaymentMethodFormData {
  methodName: string;
  methodType: "upi" | "bank";
  upiId?: string;
  qrCode?: string | File | null;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isActive: boolean;
}

const PaymentMethodManagement = () => {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  const [formData, setFormData] = useState<PaymentMethodFormData>({
    methodName: "",
    methodType: "upi",
    upiId: "",
    qrCode: null,
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    isActive: true,
  });

  const { data, isLoading, error } = useAllPaymentMethods({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    methodType: typeFilter !== "all" ? typeFilter : undefined,
  });

  const createMethodMutation = useCreatePaymentMethod();
  const updateMethodMutation = useUpdatePaymentMethod();
  const deleteMethodMutation = useDeletePaymentMethod();

  const methods = data?.paymentMethods || [];
  const pagination = data?.pagination || {};

  
  const handleCreateMethod = () => {
    setFormData({
      methodName: "",
      methodType: "upi",
      upiId: "",
      qrCode: "",
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      isActive: true,
    });
    setCreateModal(true);
  };

  const handleEditMethod = (method: any) => {
    setSelectedMethod(method);
    setFormData({
      methodName: method.methodName,
      methodType: method.methodType,
      upiId: method.upiId || "",
      qrCode: method.qrCode || "",
      accountName: method.accountName || "",
      accountNumber: method.accountNumber || "",
      ifscCode: method.ifscCode || "",
      bankName: method.bankName || "",
      isActive: method.isActive,
    });
    setEditModal(true);
  };

  const handleDeleteMethod = (method: any) => {
    setSelectedMethod(method);
    setDeleteModal(true);
  };

  const confirmCreateMethod = async () => {
    if (!formData.methodName) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter method name",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    if (formData.methodType === "upi" && !formData.upiId) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter UPI ID",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    if (
      formData.methodType === "bank" &&
      (!formData.accountNumber || !formData.ifscCode)
    ) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter account details",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      const payload = new FormData();
      payload.append('methodName', formData.methodName);
      payload.append('methodType', formData.methodType);
      if (formData.upiId) payload.append('upiId', formData.upiId);
      if (formData.accountName) payload.append('accountName', formData.accountName);
      if (formData.accountNumber) payload.append('accountNumber', formData.accountNumber);
      if (formData.ifscCode) payload.append('ifscCode', formData.ifscCode);
      if (formData.bankName) payload.append('bankName', formData.bankName);
      payload.append('isActive', String(formData.isActive));
      if (formData.qrCode && formData.qrCode instanceof File) {
        payload.append('qrCodeImage', formData.qrCode);
      }

      await createMethodMutation.mutateAsync(payload as any);

      notifications.show({
        title: "Success",
        message: "Payment method created successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setCreateModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to create payment method",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmUpdateMethod = async () => {
    if (!selectedMethod) return;

    try {
      const payload = new FormData();
      payload.append('methodName', formData.methodName);
      payload.append('methodType', formData.methodType);
      if (formData.upiId) payload.append('upiId', formData.upiId);
      if (formData.accountName) payload.append('accountName', formData.accountName);
      if (formData.accountNumber) payload.append('accountNumber', formData.accountNumber);
      if (formData.ifscCode) payload.append('ifscCode', formData.ifscCode);
      if (formData.bankName) payload.append('bankName', formData.bankName);
      payload.append('isActive', String(formData.isActive));
      if (formData.qrCode && formData.qrCode instanceof File) {
        payload.append('qrCodeImage', formData.qrCode);
      }

      await updateMethodMutation.mutateAsync({ methodId: selectedMethod._id, data: payload as any });

      notifications.show({
        title: "Success",
        message: "Payment method updated successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setEditModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to update payment method",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmDeleteMethod = async () => {
    if (!selectedMethod) return;

    try {
      await deleteMethodMutation.mutateAsync(selectedMethod._id);

      notifications.show({
        title: "Success",
        message: "Payment method deleted successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setDeleteModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to delete payment method",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load payment methods. Please try again.
      </Alert>
    );
  }

  const rows = methods.map((method: any) => (
    <Table.Tr key={method._id}>
      <Table.Td>
        <Group gap="sm">
          <FiCreditCard size={24} />
          <div>
            <Text size="sm" fw={500}>
              {method.methodName}
            </Text>
            <Badge
              size="sm"
              color={method.methodType === "upi" ? "blue" : "green"}
            >
              {method.methodType.toUpperCase()}
            </Badge>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        {method.methodType === "upi" ? (
          <Text size="sm">{method.upiId || "N/A"}</Text>
        ) : (
          <div>
            <Text size="sm">{method.bankName}</Text>
            <Text size="xs" c="dimmed">
              ••••{method.accountNumber?.slice(-4)}
            </Text>
          </div>
        )}
      </Table.Td>
      <Table.Td>
        <Badge color={method.isActive ? "green" : "gray"} size="sm">
          {method.isActive ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          {new Date(method.createdAt).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Edit Method">
            <ActionIcon
              variant="light"
              color="orange"
              size="sm"
              onClick={() => handleEditMethod(method)}
            >
              <FiEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Method">
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={() => handleDeleteMethod(method)}
            >
              <FiTrash2 size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Flex direction="column" gap="md" className={classes.container}>
      {}
      <Paper p="md" shadow="xs" className={classes.header} radius="md">
        <Group justify="space-between" mb="md">
          <Flex gap="xs" direction="column" align="flex-start">
            <Heading order={2}>Payment Method Management</Heading>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Manage payment methods for recharges
            </Text>
          </Flex>
          <Button
            leftSection={<FiPlus />}
            onClick={handleCreateMethod}
            color="#0f2027"
            radius="xl"
          >
            Add Method
          </Button>
        </Group>

        {}
        <Stack gap="lg">
          <Group gap="md">
            <TextInput
              placeholder="Search payment methods by name or type..."
              leftSection={<FiSearch size={18} color="#666" />}
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
              placeholder="Filter by Type"
              size="md"
              radius="xl"
              data={[
                { value: "all", label: "All Types" },
                { value: "upi", label: "UPI" },
                { value: "bank", label: "Bank Transfer" },
              ]}
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value || "all");
                setActivePage(1);
              }}
              styles={{ input: { background: '#f8f9fa', border: '1px solid #eee' } }}
              clearable
            />
          </Group>

          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead bg="#f8f9fa">
                <Table.Tr>
                  <Table.Th style={{ borderRadius: '16px 0 0 0' }} ta="center">METHOD</Table.Th>
                  <Table.Th ta="center">DETAILS</Table.Th>
                  <Table.Th ta="center">STATUS</Table.Th>
                  <Table.Th ta="center">CREATED</Table.Th>
                  <Table.Th style={{ borderRadius: '0 16px 0 0' }} ta="center">ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Flex justify="center" direction="column" align="center" py={100}>
                        <Loader size="lg" color="blue" />
                        <Text c="dimmed" mt="md" fw={700}>Loading Payment Methods...</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Flex justify="center" direction="column" align="center" py={100}>
                        <ThemeIcon size={64} radius="xl" variant="light" color="gray"><FiSearch size={32} /></ThemeIcon>
                        <Text c="dimmed" mt="md" fw={700}>No payment methods found.</Text>
                      </Flex>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Flex justify="space-between" align="center" mt="xl" px="md">
            <Text size="sm" c="dimmed" fw={600}>
              Showing <Text span fw={800} c="blue.9">{rows.length}</Text> payment methods in the current view
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

      {}
      <Modal
        opened={createModal}
        onClose={() => setCreateModal(false)}
        title="Add Payment Method"
        size="lg"
        centered
      >
        <Flex direction="column" gap="md">
          <TextInput
            label="Method Name"
            placeholder="e.g., PhonePe UPI, Bank Transfer"
            value={formData.methodName}
            onChange={(e) =>
              setFormData({ ...formData, methodName: e.target.value })
            }
            required
          />

          <Select
            label="Method Type"
            placeholder="Select type"
            data={[
              { value: "upi", label: "UPI" },
              { value: "bank", label: "Bank Transfer" },
            ]}
            value={formData.methodType}
            onChange={(value: any) =>
              setFormData({ ...formData, methodType: value })
            }
            required
          />

          {formData.methodType === "upi" ? (
            <>
              <TextInput
                label="UPI ID"
                placeholder="e.g., merchant@paytm"
                value={formData.upiId}
                onChange={(e) =>
                  setFormData({ ...formData, upiId: e.target.value })
                }
                required
              />
              <div>
                <Text size="sm" fw={600} mb={6}>Upload QR Code (Optional)</Text>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setFormData((s) => ({ ...s, qrCode: file || null }));
                  }}
                />
                {formData.qrCode && typeof formData.qrCode === 'string' && (
                  <img src={formData.qrCode} alt="qr-preview" style={{ maxWidth: 200, marginTop: 8 }} />
                )}
                {formData.qrCode && formData.qrCode instanceof File && (
                  <img src={URL.createObjectURL(formData.qrCode)} alt="qr-preview" style={{ maxWidth: 200, marginTop: 8 }} />
                )}
              </div>
            </>
          ) : (
            <>
              <TextInput
                label="Account Name"
                placeholder="Enter account holder name"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                required
              />
              <TextInput
                label="Account Number"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                required
              />
              <TextInput
                label="IFSC Code"
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ifscCode: e.target.value.toUpperCase(),
                  })
                }
                required
              />
              <TextInput
                label="Bank Name"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                required
              />
            </>
          )}

          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              onClick={() => setCreateModal(false)}
              disabled={createMethodMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreateMethod}
              loading={createMethodMutation.isPending}
              leftSection={<FiPlus />}
            >
              Add Method
            </Button>
          </Group>
        </Flex>
      </Modal>

      {}
      <Modal
        opened={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Payment Method"
        size="lg"
        centered
      >
        {selectedMethod && (
          <Flex direction="column" gap="md">
            <TextInput
              label="Method Name"
              value={formData.methodName}
              onChange={(e) =>
                setFormData({ ...formData, methodName: e.target.value })
              }
              required
            />

            {formData.methodType === "upi" ? (
              <>
                <TextInput
                  label="UPI ID"
                  value={formData.upiId}
                  onChange={(e) =>
                    setFormData({ ...formData, upiId: e.target.value })
                  }
                  required
                />
                <div>
                  <Text size="sm" fw={600} mb={6}>Upload QR Code (Optional)</Text>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      setFormData((s) => ({ ...s, qrCode: file || null }));
                    }}
                  />
                  {formData.qrCode && typeof formData.qrCode === 'string' && (
                    <img src={formData.qrCode} alt="qr-preview" style={{ maxWidth: 200, marginTop: 8 }} />
                  )}
                  {formData.qrCode && formData.qrCode instanceof File && (
                    <img src={URL.createObjectURL(formData.qrCode)} alt="qr-preview" style={{ maxWidth: 200, marginTop: 8 }} />
                  )}
                </div>
              </>
            ) : (
              <>
                <TextInput
                  label="Account Name"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  required
                />
                <TextInput
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  required
                />
                <TextInput
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ifscCode: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
                <TextInput
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  required
                />
              </>
            )}

            <Switch
              label="Active Status"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.currentTarget.checked })
              }
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setEditModal(false)}
                disabled={updateMethodMutation.isPending}
              >
                Cancel
              </Button>
              <Button
              color="#0f2027"
                onClick={confirmUpdateMethod}
                loading={updateMethodMutation.isPending}
                leftSection={<FiEdit />}
              >
                Update Method
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {}
      <Modal
        opened={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Payment Method"
        centered
      >
        {selectedMethod && (
          <Flex direction="column" gap="md">
            <Alert icon={<FiAlertCircle />} title="Warning" color="red">
              Are you sure you want to delete this payment method?
            </Alert>

            <Text size="sm" c="dimmed">
              Method: <strong>{selectedMethod.methodName}</strong>
            </Text>

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setDeleteModal(false)}
                disabled={deleteMethodMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmDeleteMethod}
                loading={deleteMethodMutation.isPending}
                leftSection={<FiTrash2 />}
              >
                Delete Method
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default PaymentMethodManagement;
