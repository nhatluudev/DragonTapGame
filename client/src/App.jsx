import { createBrowserRouter, RouterProvider, useRoutes } from "react-router-dom";
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
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;