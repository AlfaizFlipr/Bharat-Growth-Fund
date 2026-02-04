import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Loader,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Paper,
  Stack,
  ThemeIcon,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Trophy, Clock, ShieldCheck, Zap, ArrowRight, Wallet, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useVerifyUserQuery } from "../../hooks/query/useGetVerifyUser.query";

const Task: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.auth);
  const { data: verifyData, isLoading } = useVerifyUserQuery();

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" color="#203a43" />
      </Center>
    );
  }

  const user = verifyData?.data?.user || userData;
  const currentLevelNumber = Number(user?.currentLevelNumber ?? -1);
  const hasLevel = currentLevelNumber >= 0;
  const dailyReward =
    verifyData?.data?.stats?.todayIncome ?? user?.todayIncome ?? user?.dailyIncome ?? 0;
  const totalRewards = verifyData?.data?.stats?.totalRevenue ?? user?.totalRevenue ?? 0;

  if (!hasLevel) {
    return (
      <Box bg="#f8f9fa" style={{ minHeight: "100vh", paddingBottom: 100 }}>
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
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="xl">
              <Zap size={24} color="#d4af37" />
            </ThemeIcon>
            <Text size="22px" fw={900} style={{ letterSpacing: '-0.5px' }}>Daily Rewards</Text>
            <Text size="xs" c="rgba(255,255,255,0.5)" ta="center">Activate a membership plan to start earning.</Text>
          </Stack>
        </Box>

        <Container size="sm" mt={20}>
          <Paper radius="32px" p="xl" withBorder shadow="xl" style={{ textAlign: 'center' }}>
            <ThemeIcon size={64} radius="xl" color="gray.1" mb="md">
              <ShieldCheck size={32} color="#94a3b8" />
            </ThemeIcon>
            <Text fw={900} size="xl" mb="xs">No Active Plan Found</Text>
            <Text size="sm" c="dimmed" mb="xl">
              You haven't purchased a membership level yet. Daily rewards are exclusive to active members.
            </Text>
            <Button
              fullWidth
              size="lg"
              radius="xl"
              onClick={() => navigate("/level")}
              rightSection={<ArrowRight size={20} />}
              color="#203a43"
              style={{ height: 60, fontWeight: 900 }}
            >
              Browse Investment Plans
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="#f1f5f9" style={{ minHeight: "100vh", paddingBottom: 100 }}>
      {}
      <Box
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "40px 20px 60px",
          borderRadius: "0 0 40px 40px",
          color: "white"
        }}
      >
        <Flex justify="space-between" align="center" mb="xl">
          <Box>
            <Text size="xs" fw={800} c="blue.4" style={{ letterSpacing: 1 }}>MEMBERSHIP LEVEL</Text>
            <Text size="24px" fw={900}>Level {currentLevelNumber}</Text>
          </Box>
          <Badge variant="filled" color="#203a43" size="lg" radius="sm">ACTIVE</Badge>
        </Flex>

        <Paper
          radius="24px"
          p="xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <Stack align="center" gap={4}>
            <Text size="xs" fw={800} c="blue.2">NEXT REWARD IN</Text>
            <Text size="48px" fw={900} style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: -2 }}>
              {timeLeft}
            </Text>
            <Flex align="center" gap={6}>
              <Clock size={14} color="#60a5fa" />
              <Text size="xs" fw={600} c="blue.1">Automated Credit at Midnight</Text>
            </Flex>
          </Stack>
        </Paper>
      </Box>

      <Container size="sm" mt={-20}>
        <Stack gap="md">
          <Paper radius="32px" p="xl" withBorder shadow="sm">
            <Flex justify="space-between" align="center" mb="xl">
              <Box>
                <Text size="xs" fw={800} c="dimmed">TODAY'S ESTIMATED REWARD</Text>
                <Text size="32px" fw={900} c="blue.9">₹{dailyReward.toLocaleString()}</Text>
              </Box>
              <ThemeIcon size={54} radius="xl" color="#203a43" variant="light">
                <Sparkles size={28} />
              </ThemeIcon>
            </Flex>

            <Divider mb="xl" label={<Badge variant="outline" color="gray" size="xs">STATISTICS</Badge>} labelPosition="center" />

            <SimpleGrid cols={1} spacing="md">
              <Box
                p="md"
                style={{
                  background: "#f8fafc",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0"
                }}
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap="sm">
                    <ThemeIcon color="emerald" variant="light" radius="md">
                      <Wallet size={18} />
                    </ThemeIcon>
                    <Text fw={700} size="sm">Total Reward Amount</Text>
                  </Flex>
                  <Text fw={900} c="emerald.9">₹{totalRewards.toLocaleString()}</Text>
                </Flex>
              </Box>
            </SimpleGrid>
          </Paper>

          <Paper radius="24px" p="lg" style={{ background: "rgba(49, 130, 206, 0.05)", border: "1px solid rgba(49, 130, 206, 0.1)" }}>
            <Flex gap="md">
              <ThemeIcon variant="light" color="#203a43">
                <Trophy size={18} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={800}>Passive Income Active</Text>
                <Text size="xs" c="dimmed">Your daily reward is calculated based on your membership tier and credited automatically. No manual tasks required.</Text>
              </Box>
            </Flex>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default Task;
