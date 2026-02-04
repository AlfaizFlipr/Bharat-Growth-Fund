import React from "react";
import { Table } from "@mantine/core";
import styles from "./common.module.scss";

interface DataTableProps extends React.ComponentProps<typeof Table> {
  children: React.ReactNode;
  className?: string;
}

const DataTable = ({ children, className = "", ...rest }: DataTableProps) => {
  return (
    <div className={styles.tableWrapper}>
      <Table className={`${styles.table} ${className}`} {...rest}>
        {children}
      </Table>
    </div>
  );
};

export default DataTable;
