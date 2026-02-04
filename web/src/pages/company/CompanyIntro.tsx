import React from "react";
import {
  Box,
  Text,
  ScrollArea,
  Container,
  Title,
  Paper,
  ThemeIcon,
  Button,
} from "@mantine/core";
import { FaChartLine } from "react-icons/fa";

const CompanyIntro: React.FC = () => {
  return (
    <Box bg="#f8f9fa" style={{ minHeight: "100vh" }}>
      {/* Header Section */}
      <Box
        style={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 100%)",
          padding: "60px 20px 40px",
          borderRadius: "0 0 30px 30px",
          color: "white",
          textAlign: "center",
        }}
      >
        <ThemeIcon size={60} radius="xl" color="teal" variant="light" mb="md">
          <FaChartLine size={30} />
        </ThemeIcon>
        <Title order={2}>Bharat Growth Fund Overview</Title>
        <Text size="sm" c="rgba(255,255,255,0.7)" mt={4}>
          General Summary of Themes Often Associated with “Bharat Growth” Funds
        </Text>
      </Box>

      {/* Content Section */}
      <Container size="sm" p="md" mt={-20}>
        <Paper radius="lg" p="xl" withBorder shadow="sm">
          <ScrollArea h="60vh" offsetScrollbars>
            <Box mb="md">
              <Text size="sm" lh={1.7} c="dimmed">
                “Bharat Growth” funds are typically positioned as investment
                vehicles focused on India’s long-term economic development,
                industrial transformation, and wealth creation opportunities.
                Below are common <b>themes and focus areas</b> often associated
                with such funds.
              </Text>
            </Box>

            <Box mb="md">
              <Text fw={700} c="#0f2027" mb={4}>
                1. Infrastructure Development
              </Text>
              <Text size="sm" lh={1.7} c="dimmed">
                Many Bharat Growth-oriented funds invest heavily in
                infrastructure — including transport, energy, housing, and
                logistics. The aim is to capture value from India’s major
                government initiatives like the <b>National Infrastructure
                Pipeline</b> and <b>Smart Cities Mission</b>.
              </Text>
            </Box>

            <Box mb="md">
              <Text fw={700} c="#0f2027" mb={4}>
                2. Manufacturing and “Make in India”
              </Text>
              <Text size="sm" lh={1.7} c="dimmed">
                These funds often align with the <b>Make in India</b> vision,
                investing in sectors like automobiles, electronics,
                pharmaceuticals, and defense manufacturing — aiming to boost
                domestic production and reduce import dependency.
              </Text>
            </Box>

            <Box mb="md">
              <Text fw={700} c="#0f2027" mb={4}>
                3. Financial Inclusion and MSME Empowerment
              </Text>
              <Text size="sm" lh={1.7} c="dimmed">
                Bharat Growth funds may also target micro-, small-, and
                medium-enterprise (MSME) segments, focusing on credit access,
                digital finance, and startup support, fostering India’s
                entrepreneurial ecosystem.
              </Text>
            </Box>

            <Box mb="md">
              <Text fw={700} c="#0f2027" mb={4}>
                4. Rural Prosperity and Agri-Modernization
              </Text>
              <Text size="sm" lh={1.7} c="dimmed">
                Investment in agriculture technology, supply chain
                modernization, rural infrastructure, and financial services for
                farmers are typical priorities to ensure inclusive growth and
                rural empowerment.
              </Text>
            </Box>

            <Box mb="md">
              <Text fw={700} c="#0f2027" mb={4}>
                5. Digital Transformation and Innovation
              </Text>
              <Text size="sm" lh={1.7} c="dimmed">
                These funds recognize technology as a growth enabler — focusing
                on fintech, e-commerce, renewable energy, and data-driven
                businesses that represent India’s emerging digital economy.
              </Text>
            </Box>

            <Box>
              <Text fw={700} c="#0f2027" mb={4}>
                6. Sustainable and Inclusive Development
              </Text>
              <Text size="sm" lh={1.7} c="dimmed">
                “Bharat Growth” often reflects a commitment to sustainability.
                Funds may integrate <b>ESG (Environmental, Social, and
                Governance)</b> principles to support clean energy, green
                technology, and social welfare projects.
              </Text>
            </Box>
          </ScrollArea>
        </Paper>

        {/* Back Button */}
        <Button
          fullWidth
          mt="xl"
          size="lg"
          radius="md"
          color="teal"
          onClick={() => window.history.back()}
        >
          Back
        </Button>
      </Container>
    </Box>
  );
};

export default CompanyIntro;