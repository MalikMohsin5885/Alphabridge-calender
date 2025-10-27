"use client";
import React from "react";
import { FaGoogle } from "react-icons/fa";
// import { toast } from "@/components/ui/use-toast";
// import { useAuth } from "@/contexts/AuthContext";

const GoogleLoginButton = ({ onSuccess, className = "" }) => {
  // const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      if (!(typeof window !== "undefined" && window.google)) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        
        script.onload = () => {
          initGoogleAuth();
        };
      } else {
        initGoogleAuth();
      }
    } catch (error) {
      console.error("Google login error:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to initialize Google login",
      //   variant: "destructive",
      // });
    }
  };

  const initGoogleAuth = () => {
    const googleAuth = typeof window !== "undefined" && window.google ? window.google.accounts?.oauth2 : undefined;
    if (!googleAuth) {
      console.error("Google OAuth library is not loaded.");
      return;
    }

  //   const client = googleAuth.initTokenClient({
  //     client_id: "34902771404-95o6rsaurj49agpr5mihlqthi0d67v7u.apps.googleusercontent.com",
  //     scope: "profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
  //     callback: async (response) => {
  //       if (response.error) {
  //         console.error("Google authentication failed", response);
  //         // toast({
  //         //   title: "Error",
  //         //   description: "Failed to authenticate with Google",
  //         //   variant: "destructive",
  //         // });
  //         return;
  //       }
  //       else{
  //         console.log(`\n\nRESPONSE =>`, response);
  //         console.log(`\n\nRESPONSE JSON => \n\n`, JSON.stringify(response, null, 2));
  //         console.log(`ACCESS TOKEN => \n\n ${response.access_token}`)
  //       }
        

  //     },
  //   });

  //   client.requestAccessToken();
  // };
//   const client = googleAuth.initCodeClient({
//     client_id:
//       "34902771404-95o6rsaurj49agpr5mihlqthi0d67v7u.apps.googleusercontent.com",
//     scope: "openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
//     ux_mode: "popup", // or "redirect" if you want full redirect flow
//     callback: (response) => {
//       if (response.error) {
//         console.error("Google authentication failed", response);
//         return;
//       } else {
//         // ✅ This gives you the AUTHORIZATION CODE
//         console.log("\n\nAUTHORIZATION CODE =>", response.code);
//       }
//     },
//   });

//   client.requestCode(); // 👈 instead of requestAccessToken()
// };
  const codeClient = googleAuth.initCodeClient({
  client_id: "34902771404-95o6rsaurj49agpr5mihlqthi0d67v7u.apps.googleusercontent.com",
  scope:
    "openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
  ux_mode: "popup",
  callback: async (response) => {
    if (response.error) {
      console.error("Google auth code failed", response);
      return;
    }
    console.log("\n\nAUTHORIZATION CODE =>", response);
    
    const token = localStorage.getItem("access_token");
    console.log("\n\nACCESS CODE =>", token);

    try {
  const backendBase = 'https://alphabridge-backend-34902771404.europe-west1.run.app';
  await fetch(`${backendBase}/auth/google/auth-code/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Add this line
        },
        body: JSON.stringify({ code: response.code }),
      });
      // console.error('Done to backend');

    } catch (e) {
      console.error('Failed to send auth code to backend', e);
    }

    // 🔹 Then: Also get Access Token
    // const tokenClient = googleAuth.initTokenClient({
    //   client_id:
    //     "34902771404-95o6rsaurj49agpr5mihlqthi0d67v7u.apps.googleusercontent.com",
    //   scope:
    //     "openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    //   callback: (tokenResponse) => {
    //     if (tokenResponse.error) {
    //       console.error("Google token failed", tokenResponse);
    //       return;
    //     }
    //     console.log("\n\nACCESS TOKEN =>", tokenResponse);
    //   },
    // });

    // tokenClient.requestAccessToken();
  },
});

// Start the code flow
codeClient.requestCode();
};


  return (
    <button
      onClick={handleGoogleLogin}
      className={`flex items-center justify-center gap-2 px-4 py-2 text-[#5C5470] border-2 border-[#5C5470] bg-white rounded-lg hover:bg-[#5C5470] hover:text-white transition duration-300 ${className}`}
    >
      <FaGoogle className="w-5 h-5" />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton; 