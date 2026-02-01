import { isMobileDevice } from './utils/deviceDetection';
import { DesktopRedirect } from './components/DesktopRedirect';
import { PermissionGate } from './components/PermissionGate';
import { Game } from './components/Game';
import './styles.css';

function App() {
    const isMobile = isMobileDevice();

    // Desktop users see redirect screen
    if (!isMobile) {
        return <DesktopRedirect />;
    }

    // Mobile users go through permission flow then play game
    return (
        <PermissionGate>
            <Game />
        </PermissionGate>
    );
}

export default App;
