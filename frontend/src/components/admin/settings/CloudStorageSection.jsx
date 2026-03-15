import React from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Cloud, Link, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CloudStorageSection({
  settings,
  updateSetting,
  updateNestedSetting,
  testingStorage,
  storageTestResult,
  onTestStorage,
}) {
  return (
    <AccordionItem value="cloudStorage" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex items-center gap-3">
          <Cloud className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Cloud Storage</h3>
            <p className="text-sm text-gray-400">Cloudflare R2 for persistent media hosting</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 pt-2">
        {settings.cloudStorage && (
          <div className="space-y-6">
            {/* Enable toggle */}
            <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div>
                <Label className="text-gray-300 font-semibold">Enable Cloudflare R2</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Use R2 to store uploaded media files in the cloud
                </p>
              </div>
              <Switch
                checked={settings.cloudStorage.enabled}
                onCheckedChange={(v) => updateSetting('cloudStorage', 'enabled', v)}
                data-testid="r2-enabled-toggle"
              />
            </div>

            {/* Default storage target */}
            <div className="space-y-2">
              <Label className="text-gray-300 font-semibold">Default Storage for New Uploads</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'local', label: 'Local only', desc: 'Stored on server disk' },
                  { value: 'r2', label: 'R2 only', desc: 'Stored in Cloudflare R2' },
                  { value: 'both', label: 'Both', desc: 'Local + R2 redundancy' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    data-testid={`storage-option-${opt.value}`}
                    onClick={() => updateSetting('cloudStorage', 'defaultStorage', opt.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      settings.cloudStorage.defaultStorage === opt.value
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* R2 Credentials */}
            <div className="space-y-4 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold text-sm">R2 Credentials</h4>
                <a
                  href="https://dash.cloudflare.com/?to=/:account/r2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Link className="w-3 h-3" /> Cloudflare Dashboard
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Create an R2 API token at Cloudflare Dashboard &rarr; R2 &rarr; Manage R2 API tokens.
                Token needs <strong className="text-gray-400">Object Read & Write</strong> permission.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-400 text-xs">Account ID</Label>
                  <Input
                    value={settings.cloudStorage.r2.accountId}
                    onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'accountId', e.target.value)}
                    placeholder="abcdef1234567890..."
                    className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    data-testid="r2-account-id"
                  />
                  <p className="text-xs text-gray-600">Found on the right side of your R2 dashboard</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-400 text-xs">Bucket Name</Label>
                  <Input
                    value={settings.cloudStorage.r2.bucket}
                    onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'bucket', e.target.value)}
                    placeholder="my-portfolio-media"
                    className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    data-testid="r2-bucket"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-400 text-xs">Access Key ID</Label>
                  <Input
                    value={settings.cloudStorage.r2.accessKeyId}
                    onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'accessKeyId', e.target.value)}
                    placeholder="API token Access Key ID"
                    className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    data-testid="r2-access-key-id"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-400 text-xs">Secret Access Key</Label>
                  <Input
                    type="password"
                    value={settings.cloudStorage.r2.secretAccessKey}
                    onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'secretAccessKey', e.target.value)}
                    placeholder="Secret Access Key"
                    className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    data-testid="r2-secret-key"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label className="text-gray-400 text-xs">Public Domain</Label>
                  <Input
                    value={settings.cloudStorage.r2.publicDomain}
                    onChange={(e) => updateNestedSetting('cloudStorage', 'r2', 'publicDomain', e.target.value)}
                    placeholder="https://pub-xxxxxxxx.r2.dev  or  https://files.yourdomain.com"
                    className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-sm"
                    data-testid="r2-public-domain"
                  />
                  <p className="text-xs text-gray-600">
                    Enable "Public access" on your R2 bucket to get a <code className="text-gray-500">pub-xxx.r2.dev</code> URL,
                    or connect your own custom domain.
                  </p>
                </div>
              </div>

              {/* Test Connection */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={onTestStorage}
                  disabled={testingStorage}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  data-testid="test-r2-connection-btn"
                >
                  {testingStorage ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Testing...</>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                {storageTestResult && (
                  <div className={`flex items-center gap-2 text-sm ${storageTestResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {storageTestResult.success
                      ? <CheckCircle className="w-4 h-4" />
                      : <XCircle className="w-4 h-4" />}
                    {storageTestResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
