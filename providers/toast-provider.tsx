"use client";

import { Toaster } from "react-hot-toast";

export const ToasterProvider = () => {
  console.log("Toaster Provider is rendered");
  return <Toaster />;
};
