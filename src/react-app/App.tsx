import { BrowserRouter as Router, Routes, Route } from "react-router";
import { LanguageProvider } from "@/react-app/contexts/LanguageContext";
import { SessionProvider, useSession } from "@/react-app/contexts/SessionContext";
import Layout from "@/react-app/components/Layout";
import RoleSelection from "@/react-app/pages/RoleSelection";
import HomePage from "@/react-app/pages/Home";
import CharactersPage from "@/react-app/pages/Characters";
import CombatPage from "@/react-app/pages/Combat";
import ShopPage from "@/react-app/pages/Shop";
import MapsPage from "@/react-app/pages/Maps";
import TravelCalculator from "@/react-app/pages/TravelCalculator";
import Bestiary from "@/react-app/pages/Bestiary";
import SettingsPage from "@/react-app/pages/Settings";

function AppContent() {
  const { session, setSession } = useSession();

  if (!session) {
    return (
      <RoleSelection 
        onRoleSelected={(role, playerName) => {
          setSession({ 
            role, 
            playerName: role === 'player' ? playerName : undefined,
            sessionId: Date.now().toString()
          });
        }} 
      />
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/combat" element={<CombatPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/travel" element={<TravelCalculator />} />
          <Route path="/bestiary" element={<Bestiary />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </LanguageProvider>
  );
}
