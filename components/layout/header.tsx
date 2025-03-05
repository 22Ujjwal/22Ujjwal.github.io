"use client";

import { File, Home, LucideSend, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
      id: 1,
      name: "Home.py",
      path: "#home",
      icon: Home,
    },
    {
      id: 2,
      name: "About-Me.py",
      path: "#about",
      icon: User,
    },
    {
      id: 3,
      name: "Projects.py",
      path: "#projects",
      icon: File,
    },
    {
      id: 3,
      name: "Contact-Info.py",
      path: "#contact",
      icon: LucideSend,
      isRight: true,
    },
  ];