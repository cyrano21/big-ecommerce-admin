"use client";

import { Toaster } from "react-hot-toast";

export const ToasterProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: 'green',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: 'green',
          }
        },
        error: {
          duration: 4000,
          style: {
            background: 'red',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: 'red',
          }
        },
      }}
    />
  );
};
