import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '../theme/theme';
import { formatCount } from '../utils/format';

// Reusable story card.
// variant: 'featured' (large, home hero) | 'tile' (carousel) | 'compact' (list row)
// `story` shape: see src/data/stories.js, with `creator` attached by the service layer.
function Cover({ story, height, style }) {
  return (
    <View style={[styles.cover, { backgroundColor: story.coverColor || colors.indigo700, height }, style]}>
      <Ionicons
        name={story.icon || 'book'}
        size={Math.min(44, height * 0.42)}
        color="rgba(251, 246, 236, 0.9)"
      />
      <View style={styles.formatBadge}>
        <Text style={styles.formatText}>{String(story.format || 'Text').toUpperCase()}</Text>
      </View>
    </View>
  );
}

function BookmarkButton({ saved, onToggle, dark }) {
  if (!onToggle) return null;
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from library' : 'Save to library'}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
    >
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={22}
        color={saved ? colors.coral : dark ? colors.textOnDarkMuted : colors.indigo500}
      />
    </Pressable>
  );
}

function Meta({ story, dark }) {
  const tone = dark ? colors.textOnDarkMuted : colors.textSecondary;
  return (
    <View style={styles.metaRow}>
      <Ionicons name="time-outline" size={13} color={tone} />
      <Text style={[styles.metaText, { color: tone }]}>{story.readMinutes} min</Text>
      <Ionicons name="heart" size={13} color={colors.coral} style={styles.metaGap} />
      <Text style={[styles.metaText, { color: tone }]}>{formatCount(story.likes)}</Text>
    </View>
  );
}

export default function StoryCard({ story, variant = 'compact', onPress, saved = false, onToggleSave }) {
  if (!story) return null;
  const creatorName = story.creator && story.creator.name ? story.creator.name : 'Unknown creator';
  const handlePress = () => onPress && onPress(story);
  const handleToggle = onToggleSave ? () => onToggleSave(story.id) : undefined;
  const a11y = `${story.title} by ${creatorName}, ${story.genre}`;

  if (variant === 'featured') {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        style={({ pressed }) => [styles.featured, shadows.card, pressed && styles.pressed]}
      >
        <Cover story={story} height={150} style={styles.featuredCover} />
        <View style={styles.featuredBody}>
          <Text style={styles.genreDark}>{story.genre.toUpperCase()}</Text>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {story.title}
          </Text>
          <Text style={styles.featuredBlurb} numberOfLines={2}>
            {story.blurb}
          </Text>
          <View style={styles.featuredFooter}>
            <View style={styles.flex}>
              <Text style={styles.featuredAuthor} numberOfLines={1}>
                {creatorName}
              </Text>
              <Meta story={story} dark />
            </View>
            <BookmarkButton saved={saved} onToggle={handleToggle} dark />
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === 'tile') {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <Cover story={story} height={120} style={styles.tileCover} />
        <Text style={styles.tileTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.tileAuthor} numberOfLines={1}>
          {creatorName}
        </Text>
        <Meta story={story} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.compact, pressed && styles.pressed]}
    >
      <Cover story={story} height={84} style={styles.compactCover} />
      <View style={styles.compactBody}>
        <Text style={styles.genre}>{story.genre.toUpperCase()}</Text>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.compactAuthor} numberOfLines={1}>
          {creatorName}
        </Text>
        <Meta story={story} />
      </View>
      <BookmarkButton saved={saved} onToggle={handleToggle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  cover: { alignItems: 'center', justifyContent: 'center' },
  formatBadge: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.sm,
    backgroundColor: 'rgba(18, 15, 46, 0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  formatText: { ...typography.micro, fontSize: 9, color: colors.textOnDark },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { ...typography.caption, fontSize: 12, marginLeft: 4 },
  metaGap: { marginLeft: spacing.md },

  genre: { ...typography.micro, fontSize: 10, color: colors.violet },
  genreDark: { ...typography.micro, fontSize: 10, color: colors.coral },

  // featured
  featured: {
    width: 290,
    backgroundColor: colors.indigo900,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.lg,
  },
  featuredCover: { borderRadius: 0 },
  featuredBody: { padding: spacing.lg },
  featuredTitle: { ...typography.heading, fontSize: 19, color: colors.textOnDark, marginTop: 4 },
  featuredBlurb: { ...typography.caption, color: colors.textOnDarkMuted, marginTop: 6, lineHeight: 19 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  featuredAuthor: { ...typography.caption, fontWeight: '700', color: colors.textOnDark },

  // tile
  tile: { width: 150, marginRight: spacing.lg },
  tileCover: { borderRadius: radius.md, marginBottom: spacing.sm },
  tileTitle: { ...typography.caption, fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  tileAuthor: { ...typography.caption, fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // compact
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream50,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cream300,
  },
  compactCover: { width: 84, borderRadius: radius.md },
  compactBody: { flex: 1, marginHorizontal: spacing.md },
  compactTitle: { ...typography.heading, fontSize: 16, color: colors.textPrimary, marginTop: 2 },
  compactAuthor: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
