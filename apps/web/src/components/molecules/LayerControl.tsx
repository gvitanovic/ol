import { Button } from '../atoms/Button';

interface LayerControlProps {
    corineVisible: boolean;
    onToggleCorine: () => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({ onToggleCorine, corineVisible }) => {
    return (
        <div
            className="absolute top-4 right-4 p-4 bg-surface-primary rounded-lg shadow-lg border border-none"
            style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 1000,
                minWidth: '200px'
            }}
        >
            <h3
                className="text-sm font-semibold mb-2"
                style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                }}
            >
                Layer Controls
            </h3>
            <Button
                onClick={onToggleCorine}
                variant="lightBorder"
            >
                {corineVisible ? 'Hide' : 'Show'} OSM Layer
            </Button>
        </div>
    );
};