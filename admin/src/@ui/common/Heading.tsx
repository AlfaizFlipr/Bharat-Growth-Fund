import React from "react";
import { Title } from "@mantine/core";
import styles from "./common.module.scss";
import type { TitleProps } from "@mantine/core";

interface HeadingProps extends TitleProps {
  children: React.ReactNode;
}

const Heading = ({ children, order = 2, className = "", style, ...rest }: HeadingProps) => {
  return (
    <Title order={order} className={`${styles.heading} ${className}`} style={style} {...rest}>
      {children}
    </Title>
  );
};

export default Heading;
