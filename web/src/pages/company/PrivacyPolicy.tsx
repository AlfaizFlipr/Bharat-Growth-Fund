import React from "react";
import { Flex, Text, Box, ScrollArea, Container, Title, Paper, ThemeIcon, Button } from "@mantine/core";
import { FaShieldAlt, FaLock, FaUserShield, FaRegFileAlt } from "react-icons/fa";

const PrivacyPolicy: React.FC = () => {
  return (
    <Box bg="#f8f9fa" style={{ minHeight: "100vh" }}>
      <Box
        style={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 100%)",
          padding: "60px 20px 40px",
          borderRadius: "0 0 30px 30px",
          color: "white",
          textAlign: "center"
        }}
      >
        <ThemeIcon size={60} radius="xl" color="green" variant="light" mb="md">
          <FaShieldAlt size={30} />
        </ThemeIcon>
        <Title order={2}>Privacy Policy</Title>
        <Text size="sm" c="rgba(255,255,255,0.7)" mt={4}>Your security is our priority</Text>
      </Box>

      <Container size="sm" p="md" mt={-20}>
        <Paper radius="lg" p="xl" withBorder shadow="sm">
          <ScrollArea h="60vh" offsetScrollbars>
            <Box mb="xl">
              <Text size="sm" lh={1.7} c="dimmed">
                At <b>Bharat Growth Fund</b>, we are committed to protecting your personal data and your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
                We use personal data to power our services, process your transactions, communicate with you,
                for security and fraud prevention, and to comply with the law.
              </Text>
            </Box>

            <Box mb="md">
              <Flex align="center" gap="sm" mb="xs">
                <FaUserShield color="#2f855a" size={18} />
                <Text fw={700} c="#2f855a">Data Collection</Text>
              </Flex>
              <Text size="sm" lh={1.7} c="dimmed">
                We collect personal data that you provide directly to us, such as account information (phone number, name),
                payment details (bank account, UPI), and communication preferences. We also collect technical data
                related to your app usage for security purposes.
              </Text>
            </Box>

            <Box mb="md">
              <Flex align="center" gap="sm" mb="xs">
                <FaRegFileAlt color="#2f855a" size={18} />
                <Text fw={700} c="#2f855a">Data Usage</Text>
              </Flex>
              <Text size="sm" lh={1.7} c="dimmed">
                Your data is used exclusively to provide and improve our services, facilitate withdrawals/recharges,
                personalize your experience, and ensure compliance with Indian financial regulations.
                We only process data when we have a valid legal basis.
              </Text>
            </Box>

            <Box mb="md">
              <Flex align="center" gap="sm" mb="xs">
                <FaLock color="#2f855a" size={18} />
                <Text fw={700} c="#2f855a">Data Sharing</Text>
              </Flex>
              <Text size="sm" lh={1.7} c="dimmed">
                We may share data with trusted affiliates and service providers who assist in our operations.
                We DO NOT sell your personal information to third parties. Data is shared as required by law
                to prevent financial crimes.
              </Text>
            </Box>

            <Box>
              <Flex align="center" gap="sm" mb="xs">
                <FaShieldAlt color="#2f855a" size={18} />
                <Text fw={700} c="#2f855a">Your Rights</Text>
              </Flex>
              <Text size="sm" lh={1.7} c="dimmed">
                You have the right to access, correct, or request deletion of your data.
                You can manage your profile settings within the app or contact our support team
                for any privacy-related concerns.
              </Text>
            </Box>
          </ScrollArea>
        </Paper>

        <Button
          fullWidth
          mt="xl"
          size="lg"
          radius="md"
          color="green"
          onClick={() => window.history.back()}
        >
          Understand & Back
        </Button>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
