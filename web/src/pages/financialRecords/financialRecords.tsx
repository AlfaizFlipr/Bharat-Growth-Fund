import React, { useState } from "react";
import {
  Container,
  Tabs,
  Text,
  Group,
  Badge,
  Stack,
  Loader,
  Center,
  ThemeIcon,
} from "@mantine/core";
import {
  FaArrowUp,
  FaArrowDown,
  FaClock,

} from "react-icons/fa";
import {
  useWalletInfoQuery,
  useWithdrawalHistoryQuery,
} from "../../hooks/query/useWithdrawal.query";
import { useRechargeHistoryQuery } from "../../hooks/query/useRecharge.query";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import classes from "./FinancialRecords.module.scss";

const FinancialRecords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"recharge" | "withdrawal" | "referral">("recharge");

  
  const { data: walletData, isLoading: walletLoading } = useWalletInfoQuery();
  const { data: rechargeData, isLoading: rechargeLoading, isError: rechargeError } = useRechargeHistoryQuery({ page: 1, limit: 30 });
  const { data: withdrawalData, isLoading: withdrawalLoading, isError: withdrawalError } = useWithdrawalHistoryQuery({ page: 1, limit: 30 });

  const formatCurrency = (amt: number | undefined) =>
    (amt || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      completed: "teal",
      pending: "orange",
      processing: "blue",
      rejected: "red",
      failed: "red",
    };
    return map[status.toLowerCase()] || "gray";
  };

  const renderStatusBadge = (status: string) => (
    <Badge
      color={getStatusColor(status)}
      className={classes.statusBadge}
      variant="light"
    >
      {status}
    </Badge>
  );

  const renderEmpty = (msg: string, icon: React.ReactNode) => (
    <div className={classes.emptyState}>
      <ThemeIcon size={80} radius="xl" variant="light" color="gray" className={classes.emptyIcon}>
        {icon}
      </ThemeIcon>
      <Text c="dimmed" fw={600} size="sm" mt="md">
        {msg}
      </Text>
    </div>
  );

  const renderLoading = () => (
    <Center h="40vh">
      <Loader color="indigo" size="lg" type="dots" />
    </Center>
  );

  return (
    <div className={classes.financialRecords}>
      <CommonHeader heading="Financial Ledger" />

      {}
      <div className={classes.statsHeader}>
        <div className={classes.statsGrid}>
          <div className={classes.statItem}>
            <div className={classes.statLabel}>
              <FaArrowUp size={10} color="#10b981" /> Liquidity Nodes
            </div>
            <Text className={classes.statValue}>
              {walletLoading ? "..." : formatCurrency(walletData?.mainWallet)}
            </Text>
          </div>
          <div className={classes.statItem}>
            <div className={classes.statLabel}>
              <FaArrowDown size={10} color="#ef4444" /> Disbursed Capital
            </div>
            <Text className={classes.statValue}>
              {walletLoading ? "..." : formatCurrency(walletData?.commissionWallet)}
            </Text>
          </div>
        </div>
      </div>

      <Container size="sm" className={classes.tabsRoot}>
        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as any)}
          variant="unstyled"
          radius="md"
          classNames={{
            tab: classes.tabItem,
            list: classes.tabsList,
          }}
        >
          <Tabs.List grow>
            <Tabs.Tab value="recharge">Recharges</Tabs.Tab>
            <Tabs.Tab value="withdrawal">Withdrawals</Tabs.Tab>
          </Tabs.List>

          {}
          <Tabs.Panel value="recharge">
            {rechargeLoading ? renderLoading() : rechargeError || !rechargeData?.recharges?.length ?
              renderEmpty("No liquidity deposits found", <FaArrowUp />) : (
                <Stack gap="xs">
                  {rechargeData.recharges.map((r: any) => (
                    <div key={r._id} className={classes.recordCard}>
                      <Group gap="md" wrap="nowrap">
                        <div className={classes.iconWrapper} style={{ background: '#ecfdf5', color: '#10b981' }}>
                          <FaArrowUp />
                        </div>
                        <div className={classes.detailsContainer}>
                          <div className={classes.mainRow}>
                            <Text className={classes.title}>Capital Node {r.orderId.slice(-6).toUpperCase()}</Text>
                            <Text className={`${classes.amount} ${classes.positive}`}>
                              +{formatCurrency(r.amount)}
                            </Text>
                          </div>
                          <div className={classes.subRow}>
                            <Text className={classes.datetime}>
                              <FaClock /> {formatDate(r.createdAt)}
                            </Text>
                            {renderStatusBadge(r.status)}
                          </div>
                        </div>
                      </Group>
                    </div>
                  ))}
                </Stack>
              )}
          </Tabs.Panel>

          {}
          <Tabs.Panel value="withdrawal">
            {withdrawalLoading ? renderLoading() : withdrawalError || !withdrawalData?.withdrawals?.length ?
              renderEmpty("No capital disbursements found", <FaArrowDown />) : (
                <Stack gap="xs">
                  {withdrawalData.withdrawals.map((w: any) => (
                    <div key={w._id} className={classes.recordCard}>
                      <Group gap="md" wrap="nowrap">
                        <div className={classes.iconWrapper} style={{ background: '#fef2f2', color: '#ef4444' }}>
                          <FaArrowDown />
                        </div>
                        <div className={classes.detailsContainer}>
                          <div className={classes.mainRow}>
                            <Text className={classes.title}>Settlement: {w.bankName || 'USD Liquidation'}</Text>
                            <Text className={`${classes.amount} ${classes.negative}`}>
                              -{formatCurrency(w.amount)}
                            </Text>
                          </div>
                          <div className={classes.subRow}>
                            <Text className={classes.datetime}>
                              <FaClock /> {formatDate(w.createdAt)}
                            </Text>
                            {renderStatusBadge(w.status)}
                          </div>
                        </div>
                      </Group>
                    </div>
                  ))}
                </Stack>
              )}
          </Tabs.Panel>


        </Tabs>
      </Container>
    </div>
  );
};

export default FinancialRecords;
