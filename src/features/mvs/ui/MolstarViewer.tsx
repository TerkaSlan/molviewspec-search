import React from 'react';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin';

interface MolstarViewerProps {
    plugin: PluginUIContext;
}

const PluginWrapper = React.memo(function _PluginWrapper({ plugin }: { plugin: PluginUIContext }) {
    return <Plugin plugin={plugin} />;
});

export function MolstarViewer({ plugin }: MolstarViewerProps) {
    return (
        <div className="molstar-viewport">
            <PluginWrapper plugin={plugin} />
        </div>
    );
} 