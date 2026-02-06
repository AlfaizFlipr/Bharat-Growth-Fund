import React from "react";
import { Flex } from "@mantine/core";
import SidebarMenuItem from "./SidebarMenuItem";
import { navs } from "./navs";
import classes from "./sidebar.module.scss";

interface Iprops {
  showLogo: boolean;
}

const SidebarMenu: React.FC<Iprops> = ({ showLogo }) => {
  return (
    <Flex
      direction="column"
      gap={8}
      align="stretch"
      w="100%"
      className={classes.scrollContainer}
    >
    

      {navs.map((item) => (
        <SidebarMenuItem key={item.label} item={item} showIcon={showLogo} />
      ))}
    </Flex>
  );
};

export default SidebarMenu;