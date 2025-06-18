import React from 'react';
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';

interface MolstarViewerProps {
    plugin: PluginUIContext;
    isLoading?: boolean;
}

function LoadingIndicator() {
    return (
        <div className='absolute start-0 top-0 ps-4 pt-1' style={{ zIndex: 1000 }}>
            <span className='text-sm text-gray-500'>Loading...</span>
        </div>
    );
}

const PluginWrapper = React.memo(function _PluginWrapper({ plugin }: { plugin: PluginUIContext }) {
    return <Plugin plugin={plugin} />;
});

export function MolstarViewer({ plugin, isLoading = false }: MolstarViewerProps) {
    return (
        <div className='absolute inset-0'>
            <div className='w-full h-full'>
                <PluginWrapper plugin={plugin} />
                {isLoading && <LoadingIndicator />}
            </div>
        </div>
    );
} 