export interface FeatureFlags {
    useNewStateManagement: boolean;
}

const defaultFlags: FeatureFlags = {
    useNewStateManagement: true,
};

// Allow runtime configuration through URL parameters for testing
function parseFeatureFlags(): FeatureFlags {
    const params = new URLSearchParams(window.location.search);
    return {
        ...defaultFlags,
        useNewStateManagement: params.get('useNewState') === 'true',
    };
}

export const config = {
    features: parseFeatureFlags(),
}; 