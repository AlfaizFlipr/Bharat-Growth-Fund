import {
    Paper,
    SimpleGrid,
    Loader,
    Center,
    Avatar,
    Badge,
    Box,
    Tabs,
    Button,
    Group,
    ThemeIcon,
    Text,
    Pagination,
    TextInput,
    Container,
    Stack,
} from "@mantine/core";
import { FiSearch, FiUsers, FiAward, FiTrendingUp, FiUserCheck, FiCopy, FiCalendar } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { showNotification } from "@mantine/notifications";
import { useMyTeamReferralsQuery, useTeamStatsQuery, useReferralLinkQuery } from "../../hooks/query/useTeam.query";
import classes from "./MyTeamReferrals.module.scss";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

const MyTeamReferrals: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 12;

    const { data: stats } = useTeamStatsQuery();
    const { data: linkData } = useReferralLinkQuery();
    const { data: referralsData, isLoading } = useMyTeamReferralsQuery({
        page: activePage,
        limit: itemsPerPage,
        search: searchQuery,
        level: selectedLevel !== "all" ? selectedLevel : undefined,
    });

    const referrals = referralsData?.referrals || [];
    const pagination = referralsData?.pagination || {};

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getLevelBadgeColor = (level: string) => {
        const colors: any = {
            A: "red",
            B: "blue",
            C: "grape",
        };
        return colors[level] || "gray";
    };

    const totalMembers = stats?.totalMembers || 0;
    const levelCounts = stats?.teamLevels || [];
    const levelACount = levelCounts.find(l => l.level === 'A')?.count || 0;
    const levelBCount = levelCounts.find(l => l.level === 'B')?.count || 0;
    const levelCCount = levelCounts.find(l => l.level === 'C')?.count || 0;

    const handleCopyLink = () => {
        if (linkData?.referralLink) {
            navigator.clipboard.writeText(linkData.referralLink);
            showNotification({
                title: "Link Copied",
                message: "Referral link copied to clipboard",
                color: "green",
            });
        }
    };

    const handleWhatsAppShare = () => {
        if (linkData?.shareMessage) {
            const url = `https://wa.me/?text=${encodeURIComponent(linkData.shareMessage)}`;
            window.open(url, "_blank");
        }
    };

    return (
        <Box className={classes.pageContainer}>
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
                    <Text size="22px" fw={900} style={{ letterSpacing: '-0.5px' }}>My Team Network</Text>
                    <Text size="xs" c="rgba(255,255,255,0.5)" ta="center">
                        Track and grow your referral network
                    </Text>
                </Stack>
            </Box>

            <Container size="xl" className={classes.mainContent}>
                {/* Stats Grid */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="lg">
                    <Paper className={classes.statCard}>
                        <ThemeIcon size="md" radius="md" variant="light" color="blue" mb="xs">
                            <FiUsers size={18} />
                        </ThemeIcon>
                        <Text className={classes.statValue}>{totalMembers}</Text>
                        <Text className={classes.statLabel}>Total Team</Text>
                    </Paper>

                    <Paper className={classes.statCard}>
                        <ThemeIcon size="md" radius="md" variant="light" color="red" mb="xs">
                            <FiAward size={18} />
                        </ThemeIcon>
                        <Text className={classes.statValue}>{levelACount}</Text>
                        <Text className={classes.statLabel}>Level A</Text>
                    </Paper>

                    <Paper className={classes.statCard}>
                        <ThemeIcon size="md" radius="md" variant="light" color="blue" mb="xs">
                            <FiTrendingUp size={18} />
                        </ThemeIcon>
                        <Text className={classes.statValue}>{levelBCount}</Text>
                        <Text className={classes.statLabel}>Level B</Text>
                    </Paper>

                    <Paper className={classes.statCard}>
                        <ThemeIcon size="md" radius="md" variant="light" color="grape" mb="xs">
                            <FiUserCheck size={18} />
                        </ThemeIcon>
                        <Text className={classes.statValue}>{levelCCount}</Text>
                        <Text className={classes.statLabel}>Level C</Text>
                    </Paper>
                </SimpleGrid>

                {/* Referral Code & Share Section */}
                <Paper className={classes.shareSection} mb="lg">
                    <Group justify="space-between" wrap="wrap">
                        <Box>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>Your Referral Code</Text>
                            <Text fw={700} size="lg" c="#0f2027">{linkData?.referralCode || "BGF-XXXX"}</Text>
                        </Box>
                        <Group gap="xs">
                            <Button
                                leftSection={<FiCopy size={16} />}
                                onClick={handleCopyLink}
                                variant="light"
                                color="dark"
                                size="sm"
                            >
                                Copy Link
                            </Button>
                            <Button
                                leftSection={<FaWhatsapp size={18} />}
                                onClick={handleWhatsAppShare}
                                className={classes.whatsappButton}
                                size="sm"
                            >
                                Share
                            </Button>
                        </Group>
                    </Group>
                </Paper>

                {/* Filter Controls */}
                <Paper className={classes.filterCard} mb="lg">
                    <Group justify="space-between" wrap="wrap" gap="md">
                        <Tabs
                            value={selectedLevel}
                            onChange={(value) => {
                                setSelectedLevel(value || "all");
                                setActivePage(1);
                            }}
                            variant="pills"
                        >
                            <Tabs.List>
                                <Tabs.Tab value="all">All</Tabs.Tab>
                                <Tabs.Tab value="A">Level A</Tabs.Tab>
                                <Tabs.Tab value="B">Level B</Tabs.Tab>
                                <Tabs.Tab value="C">Level C</Tabs.Tab>
                            </Tabs.List>
                        </Tabs>

                        <TextInput
                            placeholder="Search members..."
                            leftSection={<FiSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setActivePage(1);
                            }}
                            style={{ minWidth: 250 }}
                        />
                    </Group>
                </Paper>

                {/* Member Cards */}
                {isLoading ? (
                    <Center py={60}>
                        <Loader size="lg" color="#0f2027" />
                    </Center>
                ) : referrals.length === 0 ? (
                    <Paper className={classes.emptyState}>
                        <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                            <FiUsers size={30} />
                        </ThemeIcon>
                        <Stack gap={4} align="center">
                            <Text fw={700} size="lg">No Members Found</Text>
                            <Text size="sm" c="dimmed">
                                {searchQuery ? "Try a different search term" : "Share your referral code to get started"}
                            </Text>
                        </Stack>
                    </Paper>
                ) : (
                    <>
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {referrals.map((referral: any) => (
                                <Paper key={referral._id} className={classes.memberCard}>
                                    <Group justify="space-between" mb="md">
                                        <Group gap="sm">
                                            <Avatar
                                                src={referral.referredUser?.picture}
                                                size={40}
                                                radius="xl"
                                            >
                                                {referral.referredUser?.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Text fw={600} size="sm" lineClamp={1}>
                                                    {referral.referredUser?.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {referral.referredUser?.phone}
                                                </Text>
                                            </Box>
                                        </Group>
                                        <Badge
                                            color={getLevelBadgeColor(referral.level)}
                                            variant="light"
                                            size="sm"
                                        >
                                            {referral.level}
                                        </Badge>
                                    </Group>

                                    <Stack gap="xs">
                                        <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Tier</Text>
                                            <Badge variant="dot" color="blue" size="sm">
                                                {referral.referredUser?.currentLevel || "STARTER"}
                                            </Badge>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Investment</Text>
                                            <Text size="sm" fw={600}>
                                                ₹{referral.referredUser?.investmentAmount?.toLocaleString() || "0"}
                                            </Text>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="xs" c="dimmed">Commission Earned</Text>
                                            <Text size="sm" fw={700} c="green.7">
                                                ₹{referral.totalEarnings?.toLocaleString() || "0"}
                                            </Text>
                                        </Group>
                                        <Group justify="flex-end" gap={4} mt="xs">
                                            <FiCalendar size={10} color="#94a3b8" />
                                            <Text size="10px" c="dimmed">
                                                {formatDate(referral.referredUser?.joinedAt)}
                                            </Text>
                                        </Group>
                                    </Stack>
                                </Paper>
                            ))}
                        </SimpleGrid>

                        {(pagination as any)?.totalPages > 1 && (
                            <Center mt="xl">
                                <Pagination
                                    value={activePage}
                                    onChange={setActivePage}
                                    total={(pagination as any).totalPages}
                                    size="sm"
                                    radius="md"
                                />
                            </Center>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default MyTeamReferrals;