import React from 'react';
import { Switch } from '../../ui/switch';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Zap, Activity, RefreshCw, FileText, Search } from 'lucide-react';

export default function AdminTopbarSection({ settings, updateSetting }) {
  return (
    <AccordionItem value="admin-topbar" className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <div className="text-left">
            <div className="text-lg font-semibold text-white">Admin Topbar Elements</div>
            <div className="text-sm text-gray-400 font-normal">
              Configure which tools and features appear in the admin topbar
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <p className="text-sm text-gray-400">
            Control which quick-access tools and features appear in the admin topbar. As you implement more features, you can toggle them on/off here.
          </p>

          {/* Quick Actions Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Notifications</p>
                    <p className="text-xs text-gray-400">Show notification bell with alerts</p>
                  </div>
                </div>
                <Switch
                  checked={settings?.adminTopbar?.showNotifications ?? false}
                  onCheckedChange={(checked) => updateSetting('adminTopbar.showNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Clear Cache</p>
                    <p className="text-xs text-gray-400">Quick cache clearing button</p>
                  </div>
                </div>
                <Switch
                  checked={settings?.adminTopbar?.showClearCache ?? false}
                  onCheckedChange={(checked) => updateSetting('adminTopbar.showClearCache', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <FileText className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Ecommerce Orders</p>
                    <p className="text-xs text-gray-400">Quick view of pending orders</p>
                  </div>
                </div>
                <div className="px-2 py-1 text-xs bg-gray-700 rounded text-gray-400">Coming Soon</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Search className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Quick Search</p>
                    <p className="text-xs text-gray-400">Global admin search (Cmd+K)</p>
                  </div>
                </div>
                <div className="px-2 py-1 text-xs bg-gray-700 rounded text-gray-400">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Display Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Show Preview Toggle</p>
                  <p className="text-xs text-gray-400">Quick toggle between edit/preview modes</p>
                </div>
                <Switch
                  checked={settings?.adminTopbar?.showPreviewToggle ?? true}
                  onCheckedChange={(checked) => updateSetting('adminTopbar.showPreviewToggle', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">Show Save Status</p>
                  <p className="text-xs text-gray-400">Display auto-save indicator</p>
                </div>
                <Switch
                  checked={settings?.adminTopbar?.showSaveStatus ?? true}
                  onCheckedChange={(checked) => updateSetting('adminTopbar.showSaveStatus', checked)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
            <p className="text-sm text-amber-300">
              <strong>Note:</strong> More topbar elements will be added as we implement additional features throughout the page builder development.
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
