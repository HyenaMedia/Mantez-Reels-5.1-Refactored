import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Trash2, Film } from 'lucide-react';

const AnimationStudio = ({ element, onUpdate }) => {
  const [animations, setAnimations] = useState(element?.animations || []);
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isStandalone = !element;

  const animationPresets = [
    { name: 'Fade In', type: 'fadeIn', duration: 1, delay: 0 },
    { name: 'Slide In Left', type: 'slideInLeft', duration: 0.8, delay: 0 },
    { name: 'Slide In Right', type: 'slideInRight', duration: 0.8, delay: 0 },
    { name: 'Slide In Up', type: 'slideInUp', duration: 0.8, delay: 0 },
    { name: 'Slide In Down', type: 'slideInDown', duration: 0.8, delay: 0 },
    { name: 'Scale Up', type: 'scaleUp', duration: 0.6, delay: 0 },
    { name: 'Rotate In', type: 'rotateIn', duration: 1, delay: 0 },
    { name: 'Bounce In', type: 'bounceIn', duration: 1, delay: 0 },
    { name: 'Zoom In', type: 'zoomIn', duration: 0.5, delay: 0 },
  ];

  const triggerTypes = [
    { value: 'onLoad', label: 'On Page Load' },
    { value: 'onScroll', label: 'On Scroll Into View' },
    { value: 'onHover', label: 'On Hover' },
    { value: 'onClick', label: 'On Click' },
    { value: 'onLoop', label: 'Continuous Loop' },
  ];

  const easingOptions = [
    'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
    'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  ];

  const addAnimation = (preset) => {
    const newAnimation = {
      id: `anim-${Date.now()}`,
      ...preset,
      trigger: 'onScroll',
      easing: 'ease-out',
      loop: false,
      loopCount: 1
    };
    const updated = [...animations, newAnimation];
    setAnimations(updated);
    onUpdate({ ...element, animations: updated });
    setSelectedAnimation(newAnimation.id);
  };

  const removeAnimation = (id) => {
    const updated = animations.filter(a => a.id !== id);
    setAnimations(updated);
    onUpdate({ ...element, animations: updated });
    if (selectedAnimation === id) setSelectedAnimation(null);
  };

  const updateAnimation = (id, updates) => {
    const updated = animations.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    setAnimations(updated);
    onUpdate({ ...element, animations: updated });
  };

  const playPreviewTimerRef = React.useRef(null);
  const playPreview = () => {
    setIsPlaying(true);
    if (playPreviewTimerRef.current) clearTimeout(playPreviewTimerRef.current);
    playPreviewTimerRef.current = setTimeout(() => setIsPlaying(false), 2000);
  };
  React.useEffect(() => {
    return () => { if (playPreviewTimerRef.current) clearTimeout(playPreviewTimerRef.current); };
  }, []);

  const selected = animations.find(a => a.id === selectedAnimation);

  const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";
  const selectClass = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

  return (
    <div className="animation-studio p-4" data-testid="animation-studio">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-3">Animation Studio</h3>
        <p className="text-sm text-gray-400 mb-4">
          {isStandalone 
            ? 'Select an element on the canvas to add animations'
            : 'Create stunning animations with timeline control and advanced triggers'
          }
        </p>
      </div>

      {isStandalone ? (
        <div className="text-center py-12 text-gray-500">
          <Film size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select an element to start adding animations</p>
        </div>
      ) : (
        <>
          {/* Animation List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Animations</label>
              <button
                onClick={() => setSelectedAnimation(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
                data-testid="add-animation-btn"
                aria-label="Add Animation"
              >
                + Add Animation
              </button>
            </div>
            
            {animations.length > 0 ? (
              <div className="space-y-2" role="list">
                {animations.map(anim => (
                  <div
                    key={anim.id}
                    role="listitem"
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedAnimation === anim.id
                        ? 'border-blue-500 bg-blue-500/15'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedAnimation(anim.id)}
                    data-testid={`animation-item-${anim.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-200">{anim.name}</div>
                        <div className="text-xs text-gray-500">
                          {anim.duration}s · {anim.trigger}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAnimation(anim.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm" role="status">
                No animations yet
              </div>
            )}
          </div>

          {/* Animation Presets */}
          {!selectedAnimation && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Add Animation</label>
              <div className="grid grid-cols-2 gap-2">
                {animationPresets.map(preset => (
                  <button
                    key={preset.type}
                    onClick={() => addAnimation(preset)}
                    className="p-3 border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-500/10 text-sm text-gray-300 transition bg-gray-800/50"
                    data-testid={`preset-${preset.type}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Animation Editor */}
          {selected && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-200">Edit Animation</h4>
                <div className="flex gap-2">
                  <button
                    onClick={playPreview}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    data-testid="play-preview-btn"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={playPreview}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              {/* Trigger */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Trigger</label>
                <select
                  value={selected.trigger}
                  onChange={(e) => updateAnimation(selected.id, { trigger: e.target.value })}
                  className={selectClass}
                >
                  {triggerTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Duration: {selected.duration}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={selected.duration}
                  onChange={(e) => updateAnimation(selected.id, { duration: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Delay */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Delay: {selected.delay}s
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={selected.delay}
                  onChange={(e) => updateAnimation(selected.id, { delay: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Easing */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Easing</label>
                <select
                  value={selected.easing}
                  onChange={(e) => updateAnimation(selected.id, { easing: e.target.value })}
                  className={selectClass}
                >
                  {easingOptions.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              {/* Loop */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="loop"
                  checked={selected.loop}
                  onChange={(e) => updateAnimation(selected.id, { loop: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 bg-gray-800 border-gray-600 rounded"
                />
                <label htmlFor="loop" className="text-sm font-medium text-gray-300">
                  Loop Animation
                </label>
              </div>

              {selected.loop && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">
                    Loop Count (0 = infinite)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={selected.loopCount}
                    onChange={(e) => updateAnimation(selected.id, { loopCount: parseInt(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}

          {/* Preview Box */}
          {isPlaying && selected && (
            <div className="mt-4 p-8 border-2 border-dashed border-blue-500/40 rounded-lg flex items-center justify-center bg-gray-800/50">
              <div
                className={`animation-preview-box bg-blue-500 text-white px-6 py-3 rounded ${selected.type}`}
                style={{
                  animation: `${selected.type} ${selected.duration}s ${selected.easing} ${selected.delay}s`
                }}
              >
                Preview
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes rotateIn {
          from { transform: rotate(-180deg) scale(0); opacity: 0; }
          to { transform: rotate(0) scale(1); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AnimationStudio;
