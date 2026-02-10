import { useState } from "react";
import {
    Text,
    Group,
    Flex,
    Table,
    Badge,
    TextInput,
    Select,
    Avatar,
    Pagination,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    ThemeIcon,
    Box,
} from "@mantine/core";
import {
    Search,
    Users,
    TrendingUp,
    Award,
    UserCheck,
    Network
} from "lucide-react";
import { useAdminTeamReferrals, useAdminTeamStatistics } from "../../hooks/query/useAdminTeam.query";
import Heading from "../../@ui/common/Heading";

const TeamReferrals = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("all");
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 10;

    const { data: statsData } = useAdminTeamStatistics();
    const { data: referralsData, isLoading } = useAdminTeamReferrals({
        page: activePage,
        limit: itemsPerPage,
        search: searchQuery,
        level: levelFilter !== "all" ? levelFilter : undefined,
    });

    const referrals = referralsData?.referrals || [];
    const pagination = referralsData?.pagination || {};
    const stats = statsData || {};

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getLevelColor = (level: string) => {
        const colors: any = {
            A: "red",
            B: "blue",
            C: "grape",
        };
        return colors[level] || "gray";
    };

    const rows = referrals.map((ref: any) => (
        <Table.Tr key={ref._id}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar src={ref.userId?.picture} radius="xl" size="sm">
                        {ref.userId?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Text size="sm" fw={700}>{ref.userId?.name}</Text>
                        <Text size="xs" c="dimmed">{ref.userId?.phone}</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Group gap="sm">
                    <Avatar src={ref.referredUserId?.picture} radius="xl" size="sm">
                        {ref.referredUserId?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Text size="sm" fw={700}>{ref.referredUserId?.name}</Text>
                        <Text size="xs" c="dimmed">{ref.referredUserId?.phone}</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge color={getLevelColor(ref.level)} variant="light">
                    Level {ref.level}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" fw={700} c="emerald">₹{ref.totalEarnings?.toFixed(2) || "0.00"}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="xs" c="dimmed">{formatDate(ref.createdAt)}</Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Box p="xl" bg="#fdfdfd" style={{ minHeight: '100vh' }}>
            <Stack gap="xl">
                <Box>
                    <Badge variant="light" color="grape" radius="sm" mb="xs">NETWORK OVERSIGHT</Badge>
                    <Heading order={1} fw={900} style={{ letterSpacing: "-1px" }}>Team Referral Management</Heading>
                    <Text c="dimmed" size="sm" fw={500}>Monitor and analyze the global referral network and commission flow.</Text>
                </Box>

                <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
                    <Paper p="md" radius="md" withBorder style={{ background: "linear-gradient(135deg, #2d1b4e 0%, #4c337b 100%)", color: 'white', border: 'none' }}>
                        <Group justify="space-between">
                            <ThemeIcon variant="light" color="rgba(255,255,255,0.1)" size={40} radius="md">
                                <Network size={22} color="#fff" />
                            </ThemeIcon>
                            <Badge variant="dot" color="blue.2" size="sm">TOTAL</Badge>
                        </Group>
                        <Stack gap={0} mt="md">
                            <Text size="22px" fw={900}>{stats.totalReferrals?.toLocaleString() || 0}</Text>
                            <Text size="10px" fw={700} opacity={0.6}>TOTAL RELATIONSHIPS</Text>
                        </Stack>
                    </Paper>

                    <Paper p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <ThemeIcon variant="light" color="red" size={40} radius="md">
                                <Users size={22} />
                            </ThemeIcon>
                            <Badge variant="outline" color="red" size="sm">LEVEL A</Badge>
                        </Group>
                        <Stack gap={0} mt="md">
                            <Text size="22px" fw={900}>{stats.levelACount?.toLocaleString() || 0}</Text>
                            <Text size="10px" fw={700} c="dimmed">DIRECT REFERRALS</Text>
                        </Stack>
                    </Paper>

                    <Paper p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <ThemeIcon variant="light" color="blue" size={40} radius="md">
                                <TrendingUp size={22} />
                            </ThemeIcon>
                            <Badge variant="outline" color="blue" size="sm">LEVEL B</Badge>
                        </Group>
                        <Stack gap={0} mt="md">
                            <Text size="22px" fw={900}>{stats.levelBCount?.toLocaleString() || 0}</Text>
                            <Text size="10px" fw={700} c="dimmed">SECONDARY NETWORK</Text>
                        </Stack>
                    </Paper>

                    <Paper p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <ThemeIcon variant="light" color="grape" size={40} radius="md">
                                <Award size={22} />
                            </ThemeIcon>
                            <Badge variant="outline" color="grape" size="sm">LEVEL C</Badge>
                        </Group>
                        <Stack gap={0} mt="md">
                            <Text size="22px" fw={900}>{stats.levelCCount?.toLocaleString() || 0}</Text>
                            <Text size="10px" fw={700} c="dimmed">TERTIARY NETWORK</Text>
                        </Stack>
                    </Paper>
                </SimpleGrid>

                <Paper p="md" radius="md" withBorder shadow="xs">
                    <Stack gap="lg">
                        <Group gap="md">
                            <TextInput
                                placeholder="Search by name or phone..."
                                leftSection={<Search size={18} color="#666" />}
                                size="md"
                                radius="xl"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setActivePage(1);
                                }}
                                style={{ flex: 1 }}
                            />
                            <Select
                                placeholder="Filter Level"
                                size="md"
                                radius="xl"
                                data={[
                                    { value: "all", label: "All Levels" },
                                    { value: "A", label: "Level A" },
                                    { value: "B", label: "Level B" },
                                    { value: "C", label: "Level C" },
                                ]}
                                value={levelFilter}
                                onChange={(value) => {
                                    setLevelFilter(value || "all");
                                    setActivePage(1);
                                }}
                            />
                        </Group>

                        <Table.ScrollContainer minWidth={800}>
                            <Table verticalSpacing="md" horizontalSpacing="md">
                                <Table.Thead bg="#f8f9fa">
                                    <Table.Tr>
                                        <Table.Th>REFERRER</Table.Th>
                                        <Table.Th>REFERRED USER</Table.Th>
                                        <Table.Th>LEVEL</Table.Th>
                                        <Table.Th>EARNINGS</Table.Th>
                                        <Table.Th>DATE</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {isLoading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={5}>
                                                <Flex justify="center" direction="column" align="center" py={100}>
                                                    <Loader size="lg" color="grape" />
                                                    <Text c="dimmed" mt="md" fw={700}>Loading Referral Data...</Text>
                                                </Flex>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : referrals.length === 0 ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={5}>
                                                <Flex justify="center" direction="column" align="center" py={100}>
                                                    <ThemeIcon size={64} radius="xl" variant="light" color="gray"><Search size={32} /></ThemeIcon>
                                                    <Text c="dimmed" mt="md" fw={700}>No referrals found.</Text>
                                                </Flex>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : rows}
                                </Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>

                        <Flex justify="space-between" align="center" mt="xl" px="md">
                            <Text size="sm" c="dimmed" fw={600}>
                                Page <Text span fw={800}>{activePage}</Text> of {pagination.totalPages || 1}
                            </Text>
                            <Pagination
                                total={pagination.totalPages || 1}
                                value={activePage}
                                onChange={setActivePage}
                                radius="xl"
                                color="grape"
                                size="sm"
                            />
                        </Flex>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
};

export default TeamReferrals;
