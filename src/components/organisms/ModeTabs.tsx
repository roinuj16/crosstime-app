import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, type ScrollViewInstance } from 'react-native';
import { LedText } from '@/components/atoms';
import { UI } from '@/theme/palette';

export interface ModeTab<K extends string> { key: K; label: string; hint: string }

/** Seletor de modos em pílulas, rolando sozinho até o modo escolhido. */
export function ModeTabs<K extends string>({ tabs, value, onChange }: { tabs: ModeTab<K>[]; value: K; onChange: (k: K) => void }) {
  const scroller = useRef<ScrollViewInstance>(null);
  const tabX = useRef<Partial<Record<K, number>>>({});
  useEffect(() => {
    const x = tabX.current[value];
    if (x != null) scroller.current?.scrollTo({ x: Math.max(0, x - 60), animated: true });
  }, [value]);

  return (
    <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} style={s.wrap} contentContainerStyle={s.tabs} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const sel = tab.key === value;
        return (
          <Pressable
            key={tab.key} onPress={() => onChange(tab.key)} onLayout={(e) => { tabX.current[tab.key] = e.nativeEvent.layout.x; }}
            accessibilityRole="tab" accessibilityState={{ selected: sel }} accessibilityHint={tab.hint}
            style={[s.tab, sel && s.sel]}
          >
            <LedText size={18} color={sel ? '#FFFFFF' : UI.muted} tracking={1.2}>{tab.label.toUpperCase()}</LedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 0, backgroundColor: UI.bg },
  tabs: { gap: 6, paddingVertical: 8, paddingHorizontal: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  sel: { backgroundColor: '#2E2E2E' },
});
