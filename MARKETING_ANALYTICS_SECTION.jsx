// Marketing & Analytics Settings Component
// Add this section to Settings.jsx before line 1020 (before </Accordion>)

{/* Marketing & Analytics Section */}
<AccordionItem value="marketing" className="bg-gray-900/50 border border-gray-800 rounded-lg">
  <AccordionTrigger className="px-6 py-4 hover:no-underline">
    <div className="flex items-center gap-3">
      <Activity className="w-5 h-5 text-purple-400" />
      <div className="text-left">
        <div className="font-semibold">Marketing & Analytics</div>
        <div className="text-sm text-gray-400 font-normal">
          Google Tag Manager, Analytics, Pixels, and Custom Scripts
        </div>
      </div>
    </div>
  </AccordionTrigger>
  <AccordionContent className="px-6 pb-6">
    <div className="space-y-6">
      {/* Google Tag Manager */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              Google Tag Manager
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Manage all your marketing tags in one place. Enter your GTM container ID (GTM-XXXXXXX)
            </p>
          </div>
          <Switch
            checked={settings.marketing?.gtm?.enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'gtm', { ...settings.marketing?.gtm, enabled: checked })}
          />
        </div>
        
        {settings.marketing?.gtm?.enabled && (
          <div className="pl-6 space-y-3">
            <div>
              <Label>Container ID</Label>
              <Input
                placeholder="GTM-XXXXXXX"
                value={settings.marketing?.gtm?.containerId || ''}
                onChange={(e) => updateSetting('marketing', 'gtm', { ...settings.marketing?.gtm, containerId: e.target.value })}
                className="bg-gray-800/50 border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in your GTM dashboard → Container ID
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Analytics 4 */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Google Analytics 4
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Track visitors and behavior. Enter your GA4 measurement ID (G-XXXXXXXXXX)
            </p>
          </div>
          <Switch
            checked={settings.marketing?.ga4?.enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'gtm', { ...settings.marketing?.ga4, enabled: checked })}
          />
        </div>
        
        {settings.marketing?.ga4?.enabled && (
          <div className="pl-6 space-y-3">
            <div>
              <Label>Measurement ID</Label>
              <Input
                placeholder="G-XXXXXXXXXX"
                value={settings.marketing?.ga4?.measurementId || ''}
                onChange={(e) => updateSetting('marketing', 'ga4', { ...settings.marketing?.ga4, measurementId: e.target.value })}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enhanced Measurement</Label>
              <Switch
                checked={settings.marketing?.ga4?.enhancedMeasurement || true}
                onCheckedChange={(checked) => updateSetting('marketing', 'ga4', { ...settings.marketing?.ga4, enhancedMeasurement: checked })}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              Automatically track page views, scrolls, outbound clicks, site search, and video engagement
            </p>
          </div>
        )}
      </div>

      {/* Facebook Pixel */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Facebook Pixel
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Track conversions, optimize ads, and build audiences
            </p>
          </div>
          <Switch
            checked={settings.marketing?.facebookPixel?.enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'facebookPixel', { ...settings.marketing?.facebookPixel, enabled: checked })}
          />
        </div>
        
        {settings.marketing?.facebookPixel?.enabled && (
          <div className="pl-6 space-y-3">
            <div>
              <Label>Pixel ID</Label>
              <Input
                placeholder="123456789012345"
                value={settings.marketing?.facebookPixel?.pixelId || ''}
                onChange={(e) => updateSetting('marketing', 'facebookPixel', { ...settings.marketing?.facebookPixel, pixelId: e.target.value })}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div>
              <Label className="text-sm">Events to Track</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.marketing?.facebookPixel?.events?.pageView !== false}
                    onChange={(e) => updateSetting('marketing', 'facebookPixel', {
                      ...settings.marketing?.facebookPixel,
                      events: { ...settings.marketing?.facebookPixel?.events, pageView: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">PageView</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.marketing?.facebookPixel?.events?.lead !== false}
                    onChange={(e) => updateSetting('marketing', 'facebookPixel', {
                      ...settings.marketing?.facebookPixel,
                      events: { ...settings.marketing?.facebookPixel?.events, lead: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Lead (Contact Form)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.marketing?.facebookPixel?.events?.viewContent !== false}
                    onChange={(e) => updateSetting('marketing', 'facebookPixel', {
                      ...settings.marketing?.facebookPixel,
                      events: { ...settings.marketing?.facebookPixel?.events, viewContent: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">ViewContent (Portfolio)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LinkedIn Insight Tag */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              LinkedIn Insight Tag
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Track conversions and retarget LinkedIn ads
            </p>
          </div>
          <Switch
            checked={settings.marketing?.linkedinInsight?.enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'linkedinInsight', { ...settings.marketing?.linkedinInsight, enabled: checked })}
          />
        </div>
        
        {settings.marketing?.linkedinInsight?.enabled && (
          <div className="pl-6">
            <div>
              <Label>Partner ID</Label>
              <Input
                placeholder="1234567"
                value={settings.marketing?.linkedinInsight?.partnerId || ''}
                onChange={(e) => updateSetting('marketing', 'linkedinInsight', { ...settings.marketing?.linkedinInsight, partnerId: e.target.value })}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Twitter/X Pixel */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-300" />
              Twitter/X Pixel
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Track website conversions from X ads
            </p>
          </div>
          <Switch
            checked={settings.marketing?.twitterPixel?.enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'twitterPixel', { ...settings.marketing?.twitterPixel, enabled: checked })}
          />
        </div>
        
        {settings.marketing?.twitterPixel?.enabled && (
          <div className="pl-6">
            <div>
              <Label>Pixel ID</Label>
              <Input
                placeholder="o1234"
                value={settings.marketing?.twitterPixel?.pixelId || ''}
                onChange={(e) => updateSetting('marketing', 'twitterPixel', { ...settings.marketing?.twitterPixel, pixelId: e.target.value })}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* TikTok Pixel */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-pink-500" />
              TikTok Pixel
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Measure ad performance and build audiences
            </p>
          </div>
          <Switch
            checked={settings.marketing?.tiktokPixel?.enabled || false}
            onCheckedChange={(checked) => updateSetting('marketing', 'tiktokPixel', { ...settings.marketing?.tiktokPixel, enabled: checked })}
          />
        </div>
        
        {settings.marketing?.tiktokPixel?.enabled && (
          <div className="pl-6">
            <div>
              <Label>Pixel ID</Label>
              <Input
                placeholder="XXXXXXXXXXXXXX"
                value={settings.marketing?.tiktokPixel?.pixelId || ''}
                onChange={(e) => updateSetting('marketing', 'tiktokPixel', { ...settings.marketing?.tiktokPixel, pixelId: e.target.value })}
                className="bg-gray-800/50 border-gray-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom Scripts */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-green-400" />
            Custom Scripts
          </Label>
          <p className="text-sm text-gray-400 mt-1">
            Add custom HTML/JavaScript code to your site
          </p>
        </div>
        
        <div className="space-y-4 pl-6">
          <div>
            <Label>Header Scripts (before &lt;/head&gt;)</Label>
            <Textarea
              placeholder="<script>console.log('Header script');</script>"
              value={settings.marketing?.customScripts?.header || ''}
              onChange={(e) => updateSetting('marketing', 'customScripts', { ...settings.marketing?.customScripts, header: e.target.value })}
              rows={4}
              className="bg-gray-800/50 border-gray-700 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              For: verification meta tags, fonts, critical CSS
            </p>
          </div>
          
          <div>
            <Label>Body Scripts (after &lt;body&gt;)</Label>
            <Textarea
              placeholder="<script>console.log('Body script');</script>"
              value={settings.marketing?.customScripts?.body || ''}
              onChange={(e) => updateSetting('marketing', 'customScripts', { ...settings.marketing?.customScripts, body: e.target.value })}
              rows={4}
              className="bg-gray-800/50 border-gray-700 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              For: chat widgets, early-loading scripts
            </p>
          </div>
          
          <div>
            <Label>Footer Scripts (before &lt;/body&gt;)</Label>
            <Textarea
              placeholder="<script>console.log('Footer script');</script>"
              value={settings.marketing?.customScripts?.footer || ''}
              onChange={(e) => updateSetting('marketing', 'customScripts', { ...settings.marketing?.customScripts, footer: e.target.value })}
              rows={4}
              className="bg-gray-800/50 border-gray-700 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              For: analytics, tracking, non-critical scripts
            </p>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-400 font-medium">⚠️ Warning</p>
            <p className="text-xs text-yellow-400/80 mt-1">
              Custom scripts can affect site performance and security. Only add code from trusted sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AccordionContent>
</AccordionItem>
