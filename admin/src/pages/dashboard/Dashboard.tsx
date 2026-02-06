import {
  SimpleGrid,
  Paper,
  Text,
  Group,
  ThemeIcon,
  RingProgress,
  Loader,
  Center,
  Box,
  Flex
} from "@mantine/core";
import {
  Users,
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import { useDashboardStatsQuery } from "../../hooks/query/dashboard.query";
import Heading from "../../@ui/common/Heading";

const Dashboard = () => {
  const { data: statsData, isLoading } = useDashboardStatsQuery();
  const stats = statsData?.stats;

  if (isLoading) {
    return (
      <Center h="80vh">
        <Loader size="lg" color="teal" type="bars" />
      </Center>
    );
  }

  const statCards = [
    {
      title: "Total Members",
      value: stats?.totalUsers || 0,
      icon: <Users size={24} />,
      color: "blue",
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    },
    {
      title: "Prime Wallet Holdings",
      value: `₹${(stats?.totalPrimeWalletBalance || 0).toLocaleString()}`,
      icon: <Wallet size={24} />,
      color: "teal",
      gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
    },
    {
      title: "Pending Recharges",
      value: stats?.pendingRechargesCount || 0,
      icon: <TrendingUp size={24} />,
      color: "violet",
      gradient: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)",
    },
    {
      title: "Pending Withdrawals",
      value: stats?.pendingWithdrawalsCount || 0,
      icon: <Clock size={24} />,
      color: "orange",
      gradient: "linear-gradient(135deg, #c2410c 0%, #f97316 100%)",
    },
  ];

  return (
    <Box p="md">
      <Flex justify="space-between" align="center" mb="xl">
        <Box>
          <Heading order={2}>Dashboard Overview</Heading>
          <Text c="dimmed" size="sm">Real-time platform statistics</Text>
        </Box>
        <ThemeIcon variant="light" size="xl" radius="md" color="teal">
          <Activity size={24} />
        </ThemeIcon>
      </Flex>

      {}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {statCards.map((stat, index) => (
          <Paper
            key={index}
            radius="lg"
            p="xl"
            shadow="sm"
            style={{
              background: stat.gradient,
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <ThemeIcon
              variant="light"
              color="white"
              size={50}
              radius="xl"
              style={{ opacity: 0.2, position: "absolute", top: 10, right: 10 }}
            >
              {stat.icon}
            </ThemeIcon>
            <Text size="xs" fw={700} style={{ opacity: 0.8, textTransform: "uppercase" }}>
              {stat.title}
            </Text>
            <Text fw={900} size="28px" mt="xs">
              {stat.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {}
        <Paper p="xl" radius="lg" shadow="sm" withBorder>
          <Heading order={4} mb="lg">Today's Transactions</Heading>
          <SimpleGrid cols={2} spacing="md">
            <Paper p="md" radius="md" bg="green.0">
              <Group>
                <ThemeIcon color="green" variant="light" radius="xl">
                  <ArrowDownRight size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="green.9" fw={700}>RECHARGES</Text>
                  <Text fw={900} size="xl" c="green.9">
                    ₹{stats?.todayRecharges?.toLocaleString() || 0}
                  </Text>
                </Box>
              </Group>
            </Paper>
            <Paper p="md" radius="md" bg="red.0">
              <Group>
                <ThemeIcon color="red" variant="light" radius="xl">
                  <ArrowUpRight size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="red.9" fw={700}>WITHDRAWALS</Text>
                  <Text fw={900} size="xl" c="red.9">
                    ₹{stats?.todayWithdrawals?.toLocaleString() || 0}
                  </Text>
                </Box>
              </Group>
            </Paper>
          </SimpleGrid>

          <Box mt="xl" p="md" bg="gray.0" style={{ borderRadius: 12 }}>
            <Flex justify="space-between" align="center">
              <Text size="sm" fw={700}>Net Cash Flow</Text>
              <Text fw={900} c={(stats?.todayRecharges - stats?.todayWithdrawals) >= 0 ? 'green' : 'red'}>
                ₹{((stats?.todayRecharges || 0) - (stats?.todayWithdrawals || 0)).toLocaleString()}
              </Text>
            </Flex>
          </Box>
        </Paper>

        {}
        <Paper p="xl" radius="lg" shadow="sm" withBorder>
          <Heading order={4} mb="lg">User Level Distribution</Heading>
          {stats?.levelDistribution?.length > 0 ? (
            <SimpleGrid cols={2}>
              {stats.levelDistribution.map((item: any) => (
                <Group key={item.level} align="center">
                  <RingProgress
                    size={80}
                    roundCaps
                    thickness={8}
                    sections={[{ value: (item.count / (stats.totalUsers || 1)) * 100, color: 'teal' }]}
                    label={
                      <Center>
                        <ShieldCheck size={20} color="#0f766e" />
                      </Center>
                    }
                  />
                  <Box>
                    <Text fw={800} size="sm">Level {item.level}</Text>
                    <Text c="dimmed" size="xs">{item.count} Members</Text>
                  </Box>
                </Group>
              ))}
            </SimpleGrid>
          ) : (
            <Center h={150}>
              <Text c="dimmed">No active level data available</Text>
            </Center>
          )}
        </Paper>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
