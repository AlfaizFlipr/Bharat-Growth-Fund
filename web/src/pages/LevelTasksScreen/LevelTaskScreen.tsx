import React, { useState } from "react";
import {
  Box,
  Loader,
  Alert,
  Text,
  Paper,
  Container,
  Flex,
  Button,
  Badge,
  Modal,
  Center,
  SimpleGrid,
  ThemeIcon,
  Stack,
  Divider,
} from "@mantine/core";
import {
  AlertCircle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Star,
  Info,
  ChevronRight,
  Sparkles,
  DollarSign,
  Briefcase,
  Lock,
} from "lucide-react";
import {
  useGetAllLevelsQuery,
  useUpgradeUserLevelMutation,
} from "../../hooks/query/useLevel.query";

const LevelTasksScreen: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetAllLevelsQuery();
  const levels: any[] = data?.levels ?? [];
  const fetchedUserLevel: any | null = data?.userLevel ?? null;
  const upgradeMutation = useUpgradeUserLevelMutation();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any | null>(null);

  const handlePurchaseClick = (level: any) => {
    setSelectedLevel(level);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedLevel) return;

    try {
      await upgradeMutation.mutateAsync({
        newLevelNumber: selectedLevel.levelNumber,
      });
      setShowPurchaseModal(false);
      setSelectedLevel(null);
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading)
    return (
      <Center h="100vh">
        <Loader color="#203a43" size="lg" />
      </Center>
    );

  if (isError)
    return (
      <Alert color="red" title="System Error" icon={<AlertCircle size={16} />} m="md" radius="lg">
        Failed to synchronize investment tiers. Please contact support.
      </Alert>
    );

  return (
    <Box bg="#f8f9fa" style={{ minHeight: "100vh" }}>
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
        <Box
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            filter: "blur(50px)",
          }}
        />

        <Stack align="center" gap={4}>
          <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={48} radius="xl">
            <TrendingUp size={24} color="#d4af37" />
          </ThemeIcon>
          <Text size="22px" fw={900} style={{ letterSpacing: '-0.5px' }}>Levels</Text>
          <Text size="xs" c="rgba(255,255,255,0.5)" ta="center">
            Investment Tiers & Active Plans
          </Text>
        </Stack>
      </Box>

      <Container size="sm" p="md" mt={-30}>
        <Flex direction="column" gap="xl">
          {levels.map((level) => {
            const isCurrent = level.isCurrent;
            const currentUserLevelNum = Number(fetchedUserLevel?.currentLevelNumber ?? -1);
            const isReachableNext = level.levelNumber === currentUserLevelNum + 1;
            const canAfford = (fetchedUserLevel?.mainWallet ?? 0) >= level.purchasePrice;
            const isClickable = (level.levelNumber > currentUserLevelNum && (canAfford || isReachableNext)) || level.isUnlocked;
            return (
              <Paper
                key={level._id}
                radius="32px"
                p="xl"
                withBorder
                style={{
                  position: "relative",
                  border: isCurrent ? "2px solid #3182ce" : "1px solid #eee",
                  background: isCurrent ? "white" : "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  boxShadow: isCurrent ? "0 20px 40px rgba(49, 130, 206, 0.1)" : "0 10px 20px rgba(0,0,0,0.02)",
                  transition: "all 0.3s ease",
                  overflow: "hidden"
                }}
              >
                {}
                {isCurrent && (
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 6,
                      height: '100%',
                      background: 'linear-gradient(to bottom, #3182ce, #63b3ed)'
                    }}
                  />
                )}

                {isCurrent && (
                  <Badge
                    variant="filled"
                    color="#203a43"
                    size="md"
                    radius="sm"
                    style={{
                      position: "absolute",
                      top: 24,
                      right: 24,
                      boxShadow: "0 4px 6px rgba(49, 130, 206, 0.2)"
                    }}
                    leftSection={<ShieldCheck size={12} />}
                  >
                    ACTIVE PLAN
                  </Badge>
                )}

                <Flex align="center" gap="lg" mb="xl">
                  <ThemeIcon
                    size={64}
                    radius="20px"
                    variant="gradient"
                    gradient={{ from: 'blue.8', to: 'blue.4', deg: 135 }}
                    style={{ flexShrink: 0 }}
                  >
                    {level.levelNumber === 0 ? <Star size={28} /> :
                      level.levelNumber <= 2 ? <Briefcase size={28} /> :
                        <Zap size={28} />}
                  </ThemeIcon>
                  <Box>
                    <Text size="22px" fw={900} c="#1a365d" style={{ letterSpacing: -0.5 }}>
                      {level.level || `Bronze Series ${level.levelNumber}`}
                    </Text>
                    <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: 0.5 }}>
                      TIER LEVEL {level.levelNumber}
                    </Text>
                  </Box>
                </Flex>

                <SimpleGrid cols={2} spacing="md" mb="xl">
                  <Box p="md" style={{ background: "rgba(49, 130, 206, 0.04)", borderRadius: "20px", border: '1px solid rgba(49, 130, 206, 0.1)' }}>
                    <Flex align="center" gap={6} mb={4}>
                      <DollarSign size={14} color="#3182ce" />
                      <Text size="10px" c="blue.7" fw={800}>EST. DAILY YIELD</Text>
                    </Flex>
                    <Text size="xl" fw={900} c="#2c5282">
                      ₹{level.dailyIncome}
                    </Text>
                  </Box>
                  <Box p="md" style={{ background: "rgba(26, 32, 44, 0.04)", borderRadius: "20px", border: '1px solid rgba(26, 32, 44, 0.05)' }}>
                    <Flex align="center" gap={6} mb={4}>
                      <Lock size={14} color="#4a5568" />
                      <Text size="10px" c="gray.7" fw={800}>REQUIRED CAPITAL</Text>
                    </Flex>
                    <Text size="xl" fw={900} c="#1a202c">
                      ₹{level.purchasePrice}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Stack gap="xs" mb="xl">
                  {["Performance Guarantee", "Instant Dividends", "24/7 Priority Support"].map((benefit, i) => (
                    <Flex key={i} align="center" gap="sm">
                      <ThemeIcon size={16} radius="xl" color="#203a43" variant="light">
                        <Sparkles size={10} />
                      </ThemeIcon>
                      <Text size="xs" fw={600} c="gray.7">{benefit}</Text>
                    </Flex>
                  ))}
                </Stack>

                {!isCurrent && (
                  <Button
                    fullWidth
                    size="lg"
                    radius="xl"
                    onClick={() => handlePurchaseClick(level)}
                    loading={upgradeMutation.isPending}
                    variant={(canAfford && level.levelNumber > currentUserLevelNum) ? "filled" : "light"}
                    style={{
                      height: 54,
                      fontSize: 16,
                      fontWeight: 800,
                      boxShadow: (canAfford && level.levelNumber > currentUserLevelNum) ? '0 10px 20px rgba(49, 130, 206, 0.15)' : 'none'
                    }}
                    color={(level.levelNumber > currentUserLevelNum) ? (canAfford ? "blue" : "orange") : "gray.5"}
                    rightSection={isClickable ? <ChevronRight size={18} /> : <Lock size={18} />}
                    disabled={!isClickable}
                  >
                    {level.isUnlocked ? "Already Unlocked" :
                      (level.levelNumber > currentUserLevelNum) ?
                        (canAfford ? "Activate Tier" : `Need ₹${(level.purchasePrice - (fetchedUserLevel?.mainWallet ?? 0)).toLocaleString()} more`) :
                        `Locked: Buy Level ${level.levelNumber}`}
                  </Button>
                )}

                {isCurrent && (
                  <Button
                    fullWidth
                    size="lg"
                    radius="xl"
                    disabled
                    variant="light"
                    color="gray"
                    style={{ height: 54, fontWeight: 800 }}
                  >
                    Already Subscribed
                  </Button>
                )}
              </Paper>
            );
          })}
        </Flex>
      </Container>

      {}
      <Modal
        opened={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title={<Text fw={900} size="xl">Upgrade Tier</Text>}
        centered
        radius="24px"
        padding="xl"
      >
        {selectedLevel && (
          <Box>
            <Paper p="md" radius="lg" mb="lg" style={{ background: 'rgba(49, 130, 206, 0.05)', border: '1px solid rgba(49, 130, 206, 0.1)' }}>
              <Flex gap="md" align="center">
                <ThemeIcon size="lg" radius="md" color="#203a43">
                  <Info size={18} />
                </ThemeIcon>
                <Text size="sm" fw={600} c="gray.8">
                  You are about to activate the <strong>{selectedLevel.level}</strong> tier.
                </Text>
              </Flex>
            </Paper>

            <Stack gap="sm" mb="xl">
              <Flex justify="space-between" align="center">
                <Text size="sm" c="dimmed" fw={600}>Investment Cost</Text>
                <Text size="lg" fw={900} c="red.6">₹{selectedLevel.purchasePrice}</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text size="sm" c="dimmed" fw={600}>Available Balance</Text>
                <Text size="md" fw={700}>₹{fetchedUserLevel?.mainWallet}</Text>
              </Flex>
              <Divider />
              <Flex justify="space-between" align="center">
                <Text size="sm" c="dimmed" fw={600}>Daily Profit Earned</Text>
                <Text size="md" fw={700} c="emerald.7">+ ₹{selectedLevel.dailyIncome}</Text>
              </Flex>
            </Stack>

            <Flex gap="md">
              <Button
                variant="subtle"
                fullWidth
                radius="xl"
                size="md"
                onClick={() => setShowPurchaseModal(false)}
                color="gray"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                radius="xl"
                size="md"
                color="#203a43"
                onClick={handleConfirmPurchase}
                loading={upgradeMutation.isPending}
                style={{ boxShadow: '0 8px 16px rgba(49, 130, 206, 0.2)' }}
              >
                Confirm Upgrade
              </Button>
            </Flex>
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default LevelTasksScreen;
