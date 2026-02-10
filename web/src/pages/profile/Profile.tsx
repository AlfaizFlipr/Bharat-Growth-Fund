import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Button,
  Divider,
  Loader,
  Center,
  Stack,
  ThemeIcon,
  Avatar,
  Paper,
  Badge,
  Container,
  ActionIcon,
  SimpleGrid,
} from "@mantine/core";
import {
  User,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Zap,
  Building2,
  Settings,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { login } from "../../store/reducer/authSlice";
import { useVerifyUserQuery } from "../../hooks/query/useGetVerifyUser.query";
import { notifications } from "@mantine/notifications";
import { useLogoutMutation } from "../../hooks/mutations/useLogout.mutation";
import UpdateProfileModal from "../../components/UpdateProfileModal/UpdateProfileModal";
import { ROUTES } from "../../enum/routes";

const menuItems = [
  {
    icon: <Users size={20} />,
    title: "Team Referrals",
    path: ROUTES.MY_TEAM,
    color: "grape",
  },
  {
    icon: <Building2 size={20} />,
    title: "Company Introduction",
    path: "/company-intro",
    color: "blue",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Identity Verification",
    path: "/identity-verification",
    color: "teal",
  },
  {
    icon: <FileText size={20} />,
    title: "Financial Records",
    path: "/financial-records",
    color: "emerald",
  },
  {
    icon: <Wallet size={20} />,
    title: "USD Withdrawal",
    path: "/usd-withdrawal",
    color: "indigo",
  },
  {
    icon: <FileText size={20} />,
    title: "Privacy Policy",
    path: "/privacy-policy",
    color: "gray",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Lucky Draw",
    path: "/lucky-draw",
    color: "orange",
  },
  { icon: <LogOut size={20} />, title: "Logout", path: "logout", color: "red" },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, isLoggedIn } = useSelector(
    (state: RootState) => state.auth
  );
  const { data, isLoading, isError, refetch } = useVerifyUserQuery();
  const logoutMutation = useLogoutMutation();
  const [updateModalOpened, setUpdateModalOpened] = useState(false);

  useEffect(() => {
    if (data?.status === "success" && data.data?.user) {
      dispatch(login(data.data.user));
    } else if (isError) {
      navigate("/login");
    }
  }, [data, isError, dispatch, navigate]);

  const handleMenuClick = async (path: string) => {
    if (path === "logout") {
      try {
        await logoutMutation.mutateAsync();
        localStorage.clear();
        refetch();
        notifications.show({ title: "Logged Out", message: "Successfully logged out.", color: "green" });
        navigate("/login");
      } catch {
        localStorage.clear();
        navigate("/login");
      }
      return;
    }
    navigate(path);
  };

  if (isLoading || isLoggedIn === "loading") {
    return (
      <Center h="100vh">
        <Loader size="lg" color="blue" />
      </Center>
    );
  }

  if (isError || !userData) {
    return (
      <Center h="100vh" p="xl">
        <Box ta="center">
          <Text fw={800} size="xl" mb="md">Session Expired</Text>
          <Text c="dimmed" size="sm" mb="xl">Please login again to access your account.</Text>
          <Button fullWidth onClick={() => navigate("/login")} color="blue" radius="md">Go to Login</Button>
        </Box>
      </Center>
    );
  }

  const getImageUrl = (path: string | undefined | null): string | null => {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const baseUrl =
      import.meta.env.VITE_PUBLIC_BASE_URL || "http://localhost:5000";

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  const profileImageUrl = getImageUrl(userData.picture);

  return (
    <Box bg="#f8f9fa" style={{ minHeight: "100vh" }}>
      <Box
        style={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 100%)",
          padding: "60px 20px 60px",
          borderRadius: "0 0 40px 40px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            filter: "blur(50px)",
          }}
        />

        <Flex align="center" justify="space-between">
          <Flex align="center" gap="lg">
            <Box style={{ position: 'relative' }}>
              <Avatar
                src={profileImageUrl}
                size={80}
                radius="100%"
                style={{ border: '4px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
              >
                <User size={40} />
              </Avatar>
              <ActionIcon
                variant="filled"
                color="blue"
                size="sm"
                radius="xl"
                style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid #203a43' }}
                onClick={() => setUpdateModalOpened(true)}
              >
                <Settings size={12} />
              </ActionIcon>
            </Box>
            <Box>
              <Text size="xl" fw={900} style={{ letterSpacing: '-0.5px' }}>
                {userData.username || userData.name || "User"}
              </Text>
              <Text size="sm" c="rgba(255,255,255,0.6)" mb={4}>{userData.phone}</Text>
              <Badge variant="filled" color="green" size="sm">
                Current Level: {Number(userData.userLevel || userData.currentLevelNumber) === -1 ? "No Level" : (userData.userLevel || userData.currentLevelNumber)}
              </Badge>
            </Box>
          </Flex>
          <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={44} radius="xl">
            <ShieldCheck size={24} color="#d4af37" />
          </ThemeIcon>
        </Flex>
      </Box>

      <Container size="sm" p="md" mt={-40} style={{ position: 'relative', zIndex: 10 }}>
        { }
        <Paper
          radius="32px"
          p="xl"
          mb="xl"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
          <Stack gap="xl">
            <Box>
              <Flex align="center" gap="xs" mb={4}>
                <Wallet size={14} color="#666" />
                <Text size="xs" c="dimmed" fw={800} style={{ letterSpacing: 1.2 }}>MAIN WALLET</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Text size="38px" fw={900} c="#1a202c">₹{userData.mainWallet?.toLocaleString() || "0.00"}</Text>
                <ThemeIcon variant="light" color="emerald" size="lg" radius="md">
                  <ArrowUpRight size={20} />
                </ThemeIcon>
              </Flex>
            </Box>

            <SimpleGrid cols={2} spacing="md">
              <Button
                variant="filled"
                color="#203a43"
                size="md"
                radius="xl"
                onClick={() => navigate('/recharge')}
                leftSection={<Zap size={18} />}
                style={{ boxShadow: '0 8px 16px rgba(43, 108, 176, 0.2)' }}
              >
                Recharge
              </Button>
              <Button
                variant="outline"
                color="#203a43"
                size="md"
                radius="xl"
                onClick={() => navigate('/withdrawal')}
                leftSection={<Wallet size={18} />}
              >
                Withdraw
              </Button>
            </SimpleGrid>

            <Divider color="gray.1" />

            <SimpleGrid cols={3} spacing="xs">
              <Box ta="center">
                <Text size="10px" c="dimmed" fw={800} mb={4}>TODAY'S</Text>
                <Text fw={800} size="sm" c="emerald.7">₹{(data?.data?.stats?.todayIncome || 0).toFixed(2)}</Text>
              </Box>
              <Box ta="center" style={{ borderLeft: '1px solid #f1f1f1', borderRight: '1px solid #f1f1f1' }}>
                <Text size="10px" c="dimmed" fw={800} mb={4}>TOTAL EARNINGS</Text>
                <Text fw={800} size="sm">₹{(data?.data?.stats?.totalRevenue || 0).toFixed(2)}</Text>
              </Box>
            </SimpleGrid>
          </Stack>
        </Paper>

        { }
        <Stack gap="sm">
          <Text fw={800} size="sm" px="xs" c="dimmed">ACCOUNT SETTINGS</Text>
          <Paper radius="24px" withBorder shadow="sm" style={{ overflow: 'hidden' }}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <Flex
                  align="center"
                  justify="space-between"
                  p="lg"
                  onClick={() => handleMenuClick(item.path)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: 'white',
                    transition: 'all 0.2s ease',
                    "&:hover": { backgroundColor: '#fcfcfc' }
                  }}
                >
                  <Flex align="center" gap="lg">
                    <ThemeIcon
                      size={44}
                      radius="14px"
                      variant="light"
                      color={item.color}
                    >
                      {item.icon}
                    </ThemeIcon>
                    <Text fw={700} size="sm" c="#2d3436">{item.title}</Text>
                  </Flex>
                  <ChevronRight size={18} color="#cbd5e0" />
                </Flex>
                {index !== menuItems.length - 1 && <Divider color="gray.0" />}
              </React.Fragment>
            ))}
          </Paper>
        </Stack>

        <Box ta="center" mt="40px" mb="20px">
          <Flex align="center" justify="center" gap="xs" mb={4}>
            <TrendingUp size={14} color="#cbd5e0" />
            <Text size="xs" fw={700} c="dimmed" style={{ letterSpacing: 0.5 }}>BHARAT GROWTH FUND</Text>
          </Flex>
          <Text size="xs" c="dimmed">Advanced Financial Services Engine • v2.1.0</Text>
        </Box>
      </Container>

      <UpdateProfileModal
        opened={updateModalOpened}
        onClose={() => setUpdateModalOpened(false)}
        userData={userData}
      />
    </Box>
  );
};

export default Profile;
