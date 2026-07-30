import { AlertChannel, AlertChannelType } from '@/lib/types';

interface ChannelEditorProps {
  channels: AlertChannel[];
  onChange: (channels: AlertChannel[]) => void;
}

const CHANNEL_OPTIONS: { type: AlertChannelType; label: string; placeholder: string }[] = [
  { type: 'email', label: 'Email', placeholder: 'name@example.com' },
  { type: 'whatsapp', label: 'WhatsApp', placeholder: '+61412345678' },
  { type: 'sms', label: 'SMS', placeholder: '+61412345678' },
];

export function ChannelEditor({ channels, onChange }: ChannelEditorProps) {
  const getDestination = (type: AlertChannelType) =>
    channels.find((c) => c.type === type)?.destination ?? '';

  const setChannel = (type: AlertChannelType, enabled: boolean, destination: string) => {
    const withoutType = channels.filter((c) => c.type !== type);
    if (!enabled) {
      onChange(withoutType);
      return;
    }
    onChange([...withoutType, { type, destination }]);
  };

  return (
    <div className="space-y-2">
      {CHANNEL_OPTIONS.map((opt) => {
        const enabled = channels.some((c) => c.type === opt.type);
        return (
          <div key={opt.type} className="flex items-center gap-2">
            <label className="flex w-28 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setChannel(opt.type, e.target.checked, getDestination(opt.type))}
              />
              {opt.label}
            </label>
            <input
              type="text"
              disabled={!enabled}
              placeholder={opt.placeholder}
              value={getDestination(opt.type)}
              onChange={(e) => setChannel(opt.type, true, e.target.value)}
              className="flex-1 rounded-md border px-2 py-1 text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            />
          </div>
        );
      })}
    </div>
  );
}
