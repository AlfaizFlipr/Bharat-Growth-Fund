import React, { useState, useEffect } from "react";
import { Text, Group, ThemeIcon } from "@mantine/core";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
    targetDate?: Date; 
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        
        const target = targetDate || new Date();
        if (!targetDate) {
            target.setHours(24, 0, 0, 0); 
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <Group gap={4} justify="center" align="center">
            <ThemeIcon variant="transparent" color="white" size="sm">
                <Clock size={16} />
            </ThemeIcon>
            <Text fw={900} size="xl" c="white" style={{ fontFamily: "monospace" }}>
                {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
            </Text>
        </Group>
    );
};
