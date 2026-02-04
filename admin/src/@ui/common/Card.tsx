import React from "react";
import { Paper } from "@mantine/core";
import styles from "./common.module.scss";

interface CardProps extends React.ComponentProps<typeof Paper> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "", ...rest }: CardProps) => {
  return (
    <Paper className={`${styles.card} ${className}`} p="md" radius="md" withBorder {...rest}>
      {children}
    </Paper>
  );
};

export default Card;
