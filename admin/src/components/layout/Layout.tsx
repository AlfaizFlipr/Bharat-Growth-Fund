

import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";

import { useState } from "react";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";


const Layout = () => {
  const [sidebar, setSidebar] = useState(false);
  return (
    <AppShell
      layout="alt"
      header={{ height: 64 }}
      navbar={{
        width: !sidebar ? 230 : 70,
        breakpoint: "xs",
      }}
      padding="0"
    >
      <AppShell.Header withBorder={false} bg="transparent">
        <Header />
      </AppShell.Header>
      <AppShell.Navbar withBorder={false}>
        <Sidebar hidden={sidebar} toggleSidebar={() => setSidebar((e) => !e)} />
      </AppShell.Navbar>
      <AppShell.Main pt={60} pr={0} pb={0} ml={10}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
