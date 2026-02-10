import React from "react";
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Image,
  Paper,
  Container,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Award,
  Zap,
  Trophy,
  Users
} from "lucide-react";
import { IMAGES } from "../../assets";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../enum/routes";

const menuItems = [
  { icon: <TrendingUp size={24} />, title: "Levels", path: "/level", color: "blue" },
  { icon: <Zap size={24} />, title: "Recharge", path: "/recharge", color: "orange" },
  { icon: <Wallet size={24} />, title: "Withdrawal", path: "/withdrawal", color: "emerald" },
  { icon: <Trophy size={24} />, title: "Rewards", path: "/rewards", color: "gold" },
  { icon: <Users size={24} />, title: "Referral", path: ROUTES.MY_TEAM, color: "grape" },
  { icon: <Building2 size={24} />, title: "Company", path: "/company-intro", color: "indigo" },
];

const banners = [
  {
    title: "Maximize Your Savings",
    subtitle: "Safe and Secure Growth",
    amount: "100% SECURE",
    desc: "Join over Active Members",
    image: IMAGES.banner1,
  },
  {
    title: "Earn Daily Rewards",
    subtitle: "High Yield Investment Plans",
    amount: "100% SECURE",
    desc: "Bharat Growth Official Fund",
    image: IMAGES.banner2,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box bg="#f8f9fa" style={{ minHeight: "100vh", paddingBottom: 10 }}>
      { }
      <Carousel
        withIndicators
        height={240}
        slideSize="100%"
        emblaOptions={{ loop: true, align: "start", slidesToScroll: 1 }}
        styles={{
          indicator: {
            width: 8,
            height: 8,
            transition: 'width 250ms ease',
            backgroundColor: 'rgba(255,255,255,0.5)',
            '&[data-active]': {
              width: 24,
              backgroundColor: '#fff',
            },
          },
        }}
      >
        {banners.map((banner) => (
          <Carousel.Slide key={banner.title}>
            <Box
              style={{
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: "0 0 32px 32px",
              }}
            >
              <Image src={banner.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                  background: 'linear-gradient(to right, rgba(15, 32, 39, 0.9) 0%, rgba(15, 32, 39, 0.4) 100%)',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Stack gap={4} pl={10}>
                  <Text fw={900} size="32px" style={{ letterSpacing: "-1px", lineHeight: 1.1 }}>
                    {banner.title}
                  </Text>
                  <Text size="sm" fw={600} c="rgba(255,255,255,0.8)" mb="md">
                    {banner.subtitle}
                  </Text>
                  <Flex align="baseline" gap="xs">
                    <Text size="36px" fw={900}>{banner.amount}</Text>
                    <ArrowUpRight size={24} color="#ffd700" />
                  </Flex>
                  <Text size="xs" fw={700} c="dimmed">
                    {banner.desc}
                  </Text>
                </Stack>
              </Box>
            </Box>
          </Carousel.Slide>
        ))}
      </Carousel>

      <Container size="sm" p="md" mt={-40} style={{ position: 'relative', zIndex: 10 }}>
        { }
        <Paper
          shadow="xl"
          radius="24px"
          p="xl"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <SimpleGrid cols={3} spacing="lg" verticalSpacing="xl">
            {menuItems.map((item) => (
              <Flex
                key={item.title}
                direction="column"
                align="center"
                onClick={() => navigate(item.path)}
                className="fade-in"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "translateY(-5px)" }
                }}
              >
                <ThemeIcon
                  size={60}
                  radius="20px"
                  variant="light"
                  color={item.color}
                  mb="xs"
                  style={{
                    boxShadow: `0 8px 16px rgba(0,0,0,0.05)`,
                  }}
                >
                  {item.icon}
                </ThemeIcon>
                <Text ta="center" size="xs" fw={700} c="#2d3436">
                  {item.title}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Paper>

        { }
        <Stack mt="xl" gap="md">
          <Flex align="center" justify="space-between">
            <Text fw={800} size="lg" c="#0f2027">Recommended Assets</Text>
            <Text size="xs" fw={700} c="blue" style={{ cursor: 'pointer' }}>View All</Text>
          </Flex>

          <SimpleGrid cols={2} spacing="md">
            <Paper p="md" radius="lg" withBorder style={{ background: '#fff' }}>
              <Flex align="center" gap="sm" mb="xs">
                <ThemeIcon color="green" variant="light" radius="md">
                  <ShieldCheck size={16} />
                </ThemeIcon>
                <Text size="xs" fw={800}>Secure Shield</Text>
              </Flex>
              <Text size="xs" c="dimmed">Your funds are protected by end-to-end encryption.</Text>
            </Paper>
            <Paper p="md" radius="lg" withBorder style={{ background: '#fff' }}>
              <Flex align="center" gap="sm" mb="xs">
                <ThemeIcon color="blue" variant="light" radius="md">
                  <Award size={16} />
                </ThemeIcon>
                <Text size="xs" fw={800}>ISO Certified</Text>
              </Flex>
              <Text size="xs" c="dimmed">Maintaining the highest industry standards.</Text>
            </Paper>
          </SimpleGrid>
        </Stack>

        { }
        <Stack mt="xl" gap="md">
          <Paper
            radius="20px"
            style={{
              overflow: "hidden",
              position: "relative",
              height: 140,
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Image src={IMAGES.ad1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '15px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                color: 'white'
              }}
            >
              <Text fw={700} size="sm">National Investment Summit 2026</Text>
              <Text size="10px" c="rgba(255,255,255,0.7)">Exclusive insights for BGF members</Text>
            </Box>
          </Paper>

        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
