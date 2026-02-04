import { useState, useEffect } from "react";
import {
  Paper,
  Text,
  Switch,
  MultiSelect,
  Button,
  Flex,
  Group,
  Card,
  Badge,
  Stack,
  Center,
  Alert,
  Grid,
} from "@mantine/core";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useWithdrawalConfigs,
  useBulkUpdateConfigs,
} from "../../hooks/query/Withdrawal.query";
import { useAllLevels } from "../../hooks/query/level.query";
import { Loader } from "lucide-react";

interface ConfigType {
  _id?: string;
  dayOfWeek: number;
  dayName: string;
  allowedLevels: number[];
  isActive: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_CONFIGS: ConfigType[] = [
  {
    dayOfWeek: 0,
    dayName: "Sunday",
    allowedLevels: [],
    isActive: false,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 1,
    dayName: "Monday",
    allowedLevels: [],
    isActive: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 2,
    dayName: "Tuesday",
    allowedLevels: [],
    isActive: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 3,
    dayName: "Wednesday",
    allowedLevels: [],
    isActive: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 4,
    dayName: "Thursday",
    allowedLevels: [],
    isActive: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 5,
    dayName: "Friday",
    allowedLevels: [],
    isActive: true,
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    dayOfWeek: 6,
    dayName: "Saturday",
    allowedLevels: [],
    isActive: true,
    startTime: "09:00",
    endTime: "17:00",
  },
];

const WithdrawalConfigPage = () => {
  const { data, isLoading, error, refetch } = useWithdrawalConfigs();
  const bulkUpdateMutation = useBulkUpdateConfigs();

  const [configs, setConfigs] = useState<ConfigType[]>(DEFAULT_CONFIGS);
  const [hasChanges, setHasChanges] = useState(false);

  const levelOptions = [
    { value: "0", label: "Apple Mini Level" },
    { value: "1", label: "Apple Level 1" },
    { value: "2", label: "Apple Level 2" },
    { value: "3", label: "Apple Level 3" },
    { value: "4", label: "Apple Level 4" },
    { value: "5", label: "Apple Level 5" },
    { value: "6", label: "Apple Level 6" },
  ];

  const { data: levelsData } = useAllLevels({ page: 1, limit: 100, isActive: true });
  const fetchedLevels = levelsData?.levels || [];

  const dynamicLevelOptions =
    fetchedLevels.length > 0
      ? fetchedLevels.map((l: any) => ({
          value: String(l.levelNumber),
          label: l.levelName || `Level ${l.levelNumber}`,
        }))
      : levelOptions;

  
  useEffect(() => {
    if (data?.configs && Array.isArray(data.configs)) {
      
      const normalized = DEFAULT_CONFIGS.map((day) => {
        const found = data.configs.find(
          (c: ConfigType) => c.dayOfWeek === day.dayOfWeek
        );
        return found
          ? {
            ...day,
            ...found,
            allowedLevels: found.allowedLevels || [],
          }
          : day;
      });
      setConfigs(normalized);
    } else {
      
      setConfigs(DEFAULT_CONFIGS);
    }
  }, [data]);

  const updateConfig = (
    dayOfWeek: number,
    field: keyof ConfigType,
    value: any
  ) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.dayOfWeek === dayOfWeek ? { ...c, [field]: value } : c
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const payload = { configs };
      await bulkUpdateMutation.mutateAsync(payload);
      await refetch();
      setHasChanges(false);
      notifications.show({
        title: "Success",
        message: "Withdrawal configurations saved successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to save configurations",
        color: "red",
        icon: <FiAlertCircle />,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert color="red" icon={<FiAlertCircle />}>
          Failed to load withdrawal configurations. Please refresh.
        </Alert>
      </Center>
    );
  }

  return (
    <Flex direction="column" gap="xl" p="xl" bg="gray.0">
      {}
      <Paper p="md" shadow="sm" withBorder radius="md">
        <Group justify="space-between" mb="md">
          <div>
            <Text size="xl" fw={900} style={{ color: '#0f2027', letterSpacing: '-0.5px' }}>Withdrawal Configuration</Text>
            <Text size="sm" c="dimmed">
              Configure which levels can withdraw on each day.
            </Text>
          </div>

          <Group>
            {hasChanges && <Badge color="orange">Unsaved</Badge>}
            <Button
              leftSection={<FiSave />}
              onClick={handleSave}
              loading={bulkUpdateMutation.isPending}
              disabled={!hasChanges}
              color="#0f2027"
              radius="xl"
            >
              Save All
            </Button>
          </Group>
        </Group>
      </Paper>

      {}
      <Paper p="lg" shadow="xs" withBorder>
        <Grid gutter="lg">
          {configs.map((config) => (
            <Grid.Col key={config.dayOfWeek} span={{ base: 12, sm: 6, lg: 4 }}>
              <Card
                withBorder
                shadow="sm"
                radius="md"
                style={{
                  borderLeft: `4px solid ${config.isActive ? "#40c057" : "#fa5252"
                    }`,
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={600}>{config.dayName}</Text>
                      <Badge
                        mt={4}
                        color={config.isActive ? "green" : "red"}
                        variant="filled"
                      >
                        {config.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                    <Switch
                      checked={config.isActive}
                      onChange={(e) =>
                        updateConfig(
                          config.dayOfWeek,
                          "isActive",
                          e.currentTarget.checked
                        )
                      }
                      color="green"
                    />
                  </Group>

                  {config.isActive && (
                    <>
                      <MultiSelect
                        label="Allowed Levels"
                        data={dynamicLevelOptions}
                        value={config.allowedLevels.map(String)}
                        onChange={(values) =>
                          updateConfig(
                            config.dayOfWeek,
                            "allowedLevels",
                            values.map(Number)
                          )
                        }
                        searchable
                        clearable
                      />

                      <Group grow>
                        <Stack gap={4}>
                          <Text size="sm">Start Time</Text>
                          <input
                            type="time"
                            value={config.startTime || ""}
                            onChange={(e) =>
                              updateConfig(
                                config.dayOfWeek,
                                "startTime",
                                e.target.value
                              )
                            }
                            style={{
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Stack>
                        <Stack gap={4}>
                          <Text size="sm">End Time</Text>
                          <input
                            type="time"
                            value={config.endTime || ""}
                            onChange={(e) =>
                              updateConfig(
                                config.dayOfWeek,
                                "endTime",
                                e.target.value
                              )
                            }
                            style={{
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #ced4da",
                            }}
                          />
                        </Stack>
                      </Group>
                    </>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>
    </Flex>
  );
};

export default WithdrawalConfigPage;
