import {
  Button,
  PasswordInput,
  Text,
  TextInput,
  Paper,
  Box,
  Stack,
  Group,
  ThemeIcon,
  Title,
  Divider,
  Center,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import classes from "./index.module.scss";
import { INITIAL_VALUES } from "../../../forms/intial-values";
import { VALIDATIONS } from "../../../forms/validations";
import { useLoginAdminMutation } from "../../../hooks/mutations/useLoginMutation";
import { showNotification } from "@mantine/notifications";
import { ROUTES } from "../../../enum/routes";
import { Shield, Lock, Mail, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: INITIAL_VALUES.LOGIN,
    validate: yupResolver(VALIDATIONS.LOGIN),
  });

  const { mutate, isPending } = useLoginAdminMutation();

  const handleSubmit = (values: typeof form.values) => {
    mutate(
      { email: values.username, password: values.password },
      {
        onSuccess: (response: TServerResponse) => {
          if (response?.status === "success") {
            showNotification({
              title: "Login Successful",
              message: "Welcome back! You have successfully logged in.",
              color: "green",
            });
            navigate(ROUTES.DASHBOARD);
          } else {
            showNotification({
              title: "Login Failed",
              message:
                response?.data?.message ||
                "Unable to log in. Please try again.",
              color: "red",
            });
          }
        },
        onError: (error) => {
          showNotification({
            title: "Login Failed",
            message:
              error?.message ?? "Something went wrong. Please try again.",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <Box className={classes.mainContainer}>

      <Paper className={classes.loginCard} withBorder radius="md" shadow="md">
        <Stack gap="xl">
          <Center mb="xs">
            <Stack align="center" gap={0}>
              <ThemeIcon
                size={70}
                radius="22px"
                variant="filled"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
                  boxShadow: '0 10px 30px rgba(30, 58, 138, 0.3)'
                }}
              >
                <Shield size={34} color="#ffd700" />
              </ThemeIcon>
              <Title order={2} mt="md" fw={900} style={{ letterSpacing: "-1px" }}>
                BHARAT GROWTH FUND
              </Title>
              <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: 1.2 }}>
                INSTITUTIONAL LOGIN • SECURE NODE
              </Text>
            </Stack>
          </Center>

          <Divider
            label={<Text size="xs" fw={700} c="dimmed">IDENTITY VERIFICATION</Text>}
            labelPosition="center"
          />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="admin@bgf.com"
                leftSection={<Mail size={16} color="#666" />}
                {...form.getInputProps("username")}
                radius="md"
                size="md"
                classNames={{ label: classes.formLabel, input: classes.formInput }}
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                leftSection={<Lock size={16} color="#666" />}
                {...form.getInputProps("password")}
                radius="md"
                size="md"
                classNames={{ label: classes.formLabel, input: classes.formInput }}
              />

              <Button
                size="lg"
                type="submit"
                loading={isPending}
                disabled={isPending}
                radius="md"
                mt="md"
                className={classes.submitButton}
              >
                Login
              </Button>
            </Stack>
          </form>

          <Box mt="xs">
            <Group justify="center" gap="xs">
              <Building2 size={12} color="#94a3b8" />
              <Text size="10px" c="dimmed" fw={700}>
                © 2026 BGF ASSET MANAGEMENT • INTERNAL USE ONLY
              </Text>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
