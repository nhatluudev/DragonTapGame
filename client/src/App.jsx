import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import TapGame from "./pages/tapGame/TapGame.jsx";
import Layout from "./Layout.jsx";
import Mission from "./pages/mission/Mission.jsx";
import Rank from "./pages/rank/Rank.jsx";
import Community from "./pages/community/Community.jsx";
import DailyLoginMission from "./components/dailyLoginMission/DailyLoginMission.jsx";
import KycMission from "./components/kycMission/KycMission.jsx";
import KycTutorial from "./components/kycMission/KycTutorial.jsx";
import InCommunityMission from "./components/InCommunityMission/InCommunityMission.jsx";
import InCommunityTutorial from "./components/InCommunityMission/InCommunityTutorial.jsx";
import OnBoard from "./components/onBoard/OnBoard.jsx"; // Import your OnBoard component

const queryClient = new QueryClient();

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <TapGame />,
      },
      {
        path: "/missions",
        element: <Mission />,
        children: [
          {
            path: "daily-login",
            element: <DailyLoginMission />,
          },
          {
            path: "check-kyc",
            element: <KycMission />,
          },
          {
            path: "check-kyc/kyc-tutorial",
            element: <KycTutorial />,
          },
          {
            path: "check-in-community",
            element: <InCommunityMission />,
          },
          {
            path: "check-in-community/check-in-community-tutorial",
            element: <InCommunityTutorial />,
          }
        ]
      },
      {
        path: "/ranks",
        element: <Rank />,
      },
      {
        path: "/community",
        element: <Community />,
      }
    ]
  },
];

const router = createBrowserRouter(routes);

function App() {
  const [showOnBoard, setShowOnBoard] = useState(true);

  useEffect(() => {
    // Hide OnBoard after 3 seconds
    const timer = setTimeout(() => {
      setShowOnBoard(false);
    }, 1000);

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {showOnBoard ? (
        <OnBoard />
      ) : (
        <RouterProvider router={router} />
      )}
    </QueryClientProvider>
  );
}

export default App;