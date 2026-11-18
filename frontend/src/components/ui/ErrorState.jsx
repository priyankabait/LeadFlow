import { AlertCircle, RefreshCw, Plug } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

export default function ErrorState({ error, onRetry, type = 'error' }) {
  const navigate = useNavigate();

  if (type === 'disconnected') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-4">
          <Plug size={32} className="text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold text-brand-text mb-2">Salesforce Not Connected</h3>
        <p className="text-brand-secondary text-sm max-w-sm mb-4">
          Connect your Salesforce account to view and manage your CRM data.
        </p>
        <Button onClick={() => navigate('/salesforce-integration')} icon={Plug}>
          Connect Salesforce
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-brand-text mb-2">Something went wrong</h3>
      <p className="text-brand-secondary text-sm max-w-sm mb-4">{error || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" icon={RefreshCw}>
          Try again
        </Button>
      )}
    </div>
  );
}
