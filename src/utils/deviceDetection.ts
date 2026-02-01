export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    hasGyroscope: boolean;
    hasCamera: boolean;
    supportsDeviceOrientation: boolean;
    userAgent: string;
}

export function detectDevice(): DeviceInfo {
    const ua = navigator.userAgent.toLowerCase();

    // Check for mobile devices
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;

    const isMobile = (isMobileUA || isTouchDevice) && isSmallScreen;
    const isTablet = (isMobileUA || isTouchDevice) && !isSmallScreen;
    const isDesktop = !isMobile && !isTablet;

    // Check for gyroscope support
    const hasGyroscope = 'DeviceOrientationEvent' in window;

    // Check for camera support
    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // Check for device orientation support
    const supportsDeviceOrientation = 'DeviceOrientationEvent' in window;

    return {
        isMobile,
        isTablet,
        isDesktop,
        hasGyroscope,
        hasCamera,
        supportsDeviceOrientation,
        userAgent: navigator.userAgent
    };
}

export function isMobileDevice(): boolean {
    const device = detectDevice();
    return device.isMobile;
}

export function canRunGame(): boolean {
    const device = detectDevice();
    return device.isMobile && device.hasCamera && device.supportsDeviceOrientation;
}
