import React from 'react';
import { QRCodeGenerator } from './QRCodeGenerator';
import '../styles/DesktopRedirect.css';

export const DesktopRedirect: React.FC = () => {
    return (
        <div className="desktop-redirect">
            <div className="desktop-redirect-content">
                <div className="logo-section">
                    <h1 className="game-title">
                        <span className="title-ar">AR</span>
                        <span className="title-zombie">ZOMBIE</span>
                        <span className="title-shooter">SHOOTER</span>
                    </h1>
                    <div className="blood-drip"></div>
                </div>

                <div className="message-section">
                    <div className="warning-icon">📱</div>
                    <h2 className="main-message">This Game is Mobile-Only</h2>
                    <p className="sub-message">
                        Experience the thrill of AR zombie hunting on your mobile device
                    </p>
                </div>

                <div className="qr-section">
                    <p className="qr-instruction">Scan to play on your phone</p>
                    <div className="qr-container">
                        <QRCodeGenerator size={220} />
                    </div>
                </div>

                <div className="install-section">
                    <h3>How to Install:</h3>
                    <ol className="install-steps">
                        <li>Open this link on your mobile browser</li>
                        <li>Tap the "Add to Home Screen" option</li>
                        <li>Grant camera and motion permissions</li>
                        <li>Start hunting zombies!</li>
                    </ol>
                </div>

                <div className="features-section">
                    <div className="feature">
                        <span className="feature-icon">🎯</span>
                        <span>AR Camera</span>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📡</span>
                        <span>Gyroscope Aiming</span>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🧟</span>
                        <span>Real-World Zombies</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
