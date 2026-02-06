import { useState } from "react";
import {
  Text,
  Group,
  Flex,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Button,
  Modal,
  Pagination,
  Loader,
  Paper,
  Grid,
  NumberInput,
  Switch,
  Stack,
  ThemeIcon,
  Tooltip,
  Alert,
  SimpleGrid,
  Box,
} from "@mantine/core";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiAward,
} from 'react-icons/fi';
import { notifications } from '@mantine/notifications';
import {
  useAllLevels,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel
} from '../../hooks/query/level.query';
import classes from './index.module.scss';
import Heading from '../../@ui/common/Heading';

interface LevelFormData {
  levelNumber: number;
  levelName: string;
  investmentAmount: number;
  dailyIncome: number;
  icon: string;
  description: string;
  order: number;
  isActive: boolean;
}

const LevelManagement = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);

  
  const [formData, setFormData] = useState<LevelFormData>({
    levelNumber: 1,
    levelName: '',
    investmentAmount: 0,
    dailyIncome: 0,
    icon: '💰',
    description: '',
    order: 0,
    isActive: true
  });

  
  const { data, isLoading, error } = useAllLevels({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    isActive: true
  });

  
  const createLevelMutation = useCreateLevel();
  const updateLevelMutation = useUpdateLevel();
  const deleteLevelMutation = useDeleteLevel();

  const levels = data?.levels || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  
  const handleCreateLevel = () => {
    setFormData({
      levelNumber: levels.length + 1,
      levelName: '',
      investmentAmount: 0,
      dailyIncome: 0,
      icon: '💰',
      description: '',
      order: levels.length + 1,
      isActive: true
    });
    setCreateModal(true);
  };

  const handleEditLevel = (level: any) => {
    setSelectedLevel(level);
    setFormData({
      levelNumber: level.levelNumber,
      levelName: level.levelName,
      investmentAmount: level.investmentAmount,
      dailyIncome: level.dailyIncome || 0,
      icon: level.icon || '💰',
      description: level.description || '',
      order: level.order,
      isActive: level.isActive
    });
    setEditModal(true);
  };

  const handleDeleteLevel = (level: any) => {
    setSelectedLevel(level);
    setDeleteModal(true);
  };

  const confirmCreateLevel = async () => {
    if (!formData.levelName || formData.dailyIncome <= 0 || formData.investmentAmount < 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill all required fields correctly',
        color: 'red',
        icon: <FiXCircle />
      });
      return;
    }

    try {
      await createLevelMutation.mutateAsync(formData);

      notifications.show({
        title: 'Success',
        message: 'Level created successfully',
        color: 'green',
        icon: <FiCheckCircle />
      });

      setCreateModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create level',
        color: 'red',
        icon: <FiXCircle />
      });
    }
  };

  const confirmUpdateLevel = async () => {
    if (!selectedLevel) return;

    try {
      await updateLevelMutation.mutateAsync({
        levelId: selectedLevel._id,
        data: formData
      });

      notifications.show({
        title: 'Success',
        message: 'Level updated successfully',
        color: 'green',
        icon: <FiCheckCircle />
      });

      setEditModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update level',
        color: 'red',
        icon: <FiXCircle />
      });
    }
  };

  const confirmDeleteLevel = async () => {
    if (!selectedLevel) return;

    try {
      await deleteLevelMutation.mutateAsync(selectedLevel._id);

      notifications.show({
        title: 'Success',
        message: 'Level deleted successfully',
        color: 'green',
        icon: <FiCheckCircle />
      });

      setDeleteModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete level',
        color: 'red',
        icon: <FiXCircle />
      });
    }
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load levels. Please try again.
      </Alert>
    );
  }

  const rows = levels.map((level: any) => (
    <Table.Tr key={level._id}>
      <Table.Td>
        <Group gap="sm">
          <Text size="xl">{level.icon}</Text>
          <div>
            <Text size="sm" fw={800} c="#0f2027">{level.levelName}</Text>
            <Text size="xs" c="dimmed">Level {level.levelNumber}</Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={700} c="blue.8">₹{level.investmentAmount?.toLocaleString()}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={700} c="green.8">₹{level.dailyIncome?.toLocaleString()}/day</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={level.isActive ? 'teal' : 'gray'} variant="light" size="sm">
          {level.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Edit Level">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleEditLevel(level)}
            >
              <FiEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Level">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDeleteLevel(level)}
            >
              <FiTrash2 size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md" className={classes.container}>
      <Stack gap="xl">
        <Box>
          <Heading order={2} fw={900} c="#0f2027">Level Management</Heading>
          <Text c="dimmed" size="sm">Configure investment tiers and daily rewards.</Text>
        </Box>

        {}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Paper p="lg" radius="lg" withBorder>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="blue" size={40} radius="md">
                <FiAward size={20} />
              </ThemeIcon>
              <Text fw={900} size="xl">{statistics.totalLevels || 0}</Text>
            </Group>
            <Text size="sm" c="dimmed" mt="xs" fw={700}>Total Levels</Text>
          </Paper>

          <Paper p="lg" radius="lg" withBorder>
            <Group justify="space-between">
              <ThemeIcon variant="light" color="teal" size={40} radius="md">
                <FiCheckCircle size={20} />
              </ThemeIcon>
              <Text fw={900} size="xl">{statistics.activeLevels || 0}</Text>
            </Group>
            <Text size="sm" c="dimmed" mt="xs" fw={700}>Active Levels</Text>
          </Paper>

          <Button
            fullWidth
            h="auto"
            radius="lg"
            color="#0f2027"
            leftSection={<FiPlus />}
            onClick={handleCreateLevel}
            style={{ justifyContent: 'center' }}
          >
            Create New Level
          </Button>
        </SimpleGrid>

        <Paper p="md" radius="lg" shadow="sm" withBorder>
          {}
          <Group gap="md" mb="lg">
            <TextInput
              placeholder="Search levels..."
              leftSection={<FiSearch size={16} />}
              radius="md"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage(1);
              }}
              style={{ flex: 1 }}
            />
          </Group>

          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="md">
              <Table.Thead bg="gray.1">
                <Table.Tr>
                  <Table.Th>Level Name</Table.Th>
                  <Table.Th>Investment</Table.Th>
                  <Table.Th>Daily Income</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Flex justify="center" p="xl"><Loader size="sm" /></Flex>
                    </Table.Td>
                  </Table.Tr>
                ) : rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text ta="center" c="dimmed" p="xl">No levels found</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Flex justify="flex-end" mt="md">
            <Pagination
              total={pagination.totalPages || 1}
              value={activePage}
              onChange={setActivePage}
              radius="md"
              size="sm"
            />
          </Flex>
        </Paper>

        {}
        <Modal
          opened={createModal || editModal}
          onClose={() => { setCreateModal(false); setEditModal(false); }}
          title={<Text fw={700}>{createModal ? 'Create New Level' : 'Edit Level'}</Text>}
          size="lg"
          centered
          radius="lg"
        >
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Level Number"
                  placeholder="1, 2, 3..."
                  value={formData.levelNumber}
                  onChange={(val) => setFormData({ ...formData, levelNumber: Number(val) })}
                  min={1}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Level Name"
                  placeholder="Tier Name"
                  value={formData.levelName}
                  onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Investment Requirement"
                  placeholder="0.00"
                  value={formData.investmentAmount}
                  onChange={(val) => setFormData({ ...formData, investmentAmount: Number(val) })}
                  min={0}
                  leftSection="₹"
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Daily Income"
                  placeholder="0.00"
                  value={formData.dailyIncome}
                  onChange={(val) => setFormData({ ...formData, dailyIncome: Number(val) })}
                  min={0}
                  leftSection="₹"
                  required
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Display Icon"
              placeholder="Emoji or text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />

            <Switch
              label="Level is Active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
              color="teal"
            />

            <Button
              fullWidth
              mt="md"
              color="#0f2027"
              onClick={createModal ? confirmCreateLevel : confirmUpdateLevel}
              loading={createModal ? createLevelMutation.isPending : updateLevelMutation.isPending}
            >
              {createModal ? 'Create Level' : 'Save Changes'}
            </Button>
          </Stack>
        </Modal>

        {}
        <Modal opened={deleteModal} onClose={() => setDeleteModal(false)} centered title="Confirm Deletion">
          <Text size="sm" mb="lg">Are you sure you want to delete <b>{selectedLevel?.levelName}</b>? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button color="red" onClick={confirmDeleteLevel} loading={deleteLevelMutation.isPending}>Delete</Button>
          </Group>
        </Modal>

      </Stack>
    </Box>
  );
};

export default LevelManagement;