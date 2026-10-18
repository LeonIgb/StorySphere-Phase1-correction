import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TabBar from '../components/TabBar';
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import CreateScreen from '../screens/CreateScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/theme';

// Dependency-free tab navigator (no React Navigation), so the app runs on any
// Snack SDK without native-module version conflicts.
//
// Screens receive a tiny `navigation` object with `navigate(name)`, the same call
// they would make with React Navigation. When story detail pages arrive in a later
// phase, this file is the single place to swap in a real navigator.
export const TABS = [
  { name: 'Home', component: HomeScreen },
  { name: 'Discover', component: DiscoverScreen },
  { name: 'Create', component: CreateScreen },
  { name: 'Library', component: LibraryScreen },
  { name: 'Profile', component: ProfileScreen },
];

export default function RootNavigator() {
  const [active, setActive] = useState('Home');
  // Screens mount the first time they are visited, then stay mounted so
  // scroll position, search text and filters survive tab switches.
  const [visited, setVisited] = useState({ Home: true });

  const navigate = useCallback((name) => {
    if (!TABS.some((t) => t.name === name)) return;
    setVisited((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    setActive(name);
  }, []);

  const navigation = useMemo(() => ({ navigate }), [navigate]);

  return (
    <View style={styles.root}>
      <View style={styles.screens}>
        {TABS.map(({ name, component: Screen }) =>
          visited[name] ? (
            <View
              key={name}
              style={[styles.screen, active !== name && styles.hidden]}
              pointerEvents={active === name ? 'auto' : 'none'}
            >
              <Screen navigation={navigation} />
            </View>
          ) : null
        )}
      </View>
      <TabBar tabs={TABS.map((t) => t.name)} active={active} onChange={navigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream100 },
  screens: { flex: 1 },
  screen: { ...StyleSheet.absoluteFillObject },
  hidden: { display: 'none' },
});
