"use client";

import { Flex } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaCrown, FaUser } from "react-icons/fa";
import { FaBolt } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./BottomNavigator.module.scss";

const BottomNavigator = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const tabs = [
    { icon: FaHome, path: "/", label: "Home" },
    { icon: FaCrown, path: "/level", label: "Level" },
    { icon: FaBolt, path: "/rewards", label: "Rewards" },
    { icon: FaUser, path: "/profile", label: "My" },
  ];

  const handleTabClick = async (path: string) => {
    navigate(path);

    try {
      switch (path) {
        case "/profile":
          await queryClient.invalidateQueries({ queryKey: ["verifyUser"] });
          break;

        case "/level":
          await queryClient.invalidateQueries({ queryKey: ["allLevels"] });
          break;

        case "/rewards":
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["team-stats"] }),
            queryClient.invalidateQueries({ queryKey: ["referral-link"] }),
            queryClient.invalidateQueries({ queryKey: ["team-members"] }),
            queryClient.invalidateQueries({ queryKey: ["tasks"] }),
          ]);
          break;

        case "/":
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["verifyUser"] }),
          ]);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error invalidating queries:", error);
    }
  };

  return (
    <div className={styles.footerWrapper}>
      <Flex justify="space-around" align="center" className={styles.footer}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;

          return (
            <Flex
              key={tab.path}
              direction="column"
              align="center"
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => handleTabClick(tab.path)}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{tab.label}</span>
            </Flex>
          );
        })}
      </Flex>
    </div>
  );
};

export default BottomNavigator;
