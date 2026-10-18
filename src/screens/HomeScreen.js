import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import IconButton from '../components/IconButton';
import SectionHeader from '../components/SectionHeader';
import StoryCard from '../components/StoryCard';
import CreatorAvatar from '../components/CreatorAvatar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import { fetchHomeFeed } from '../services/storyService';
import { useLibrary } from '../context/LibraryContext';
import { useNotice } from '../context/NoticeContext';
import { currentUser } from '../data/currentUser';
import { colors, spacing } from '../theme/theme';
import { greeting } from '../utils/format';

export default function HomeScreen({ navigation }) {
  const { showNotice } = useNotice();
  const { isSaved, toggleSaved } = useLibrary();
  const feed = useAsync(fetchHomeFeed, []);

  const openStory = (story) =>
    showNotice(
      story.title,
      'The full story reader arrives in a later phase. For now, save it to your Library to find it again.',
      'book-outline'
    );

  const openCreator = (creator) =>
    showNotice(
      creator.name,
      'Creator profile pages arrive in a later phase.',
      'person-outline'
    );

  const data = feed.data;
  const firstName = currentUser.name.split(' ')[0];

  let body;
  if (feed.loading && !data) {
    body = <LoadingState />;
  } else if (feed.error && !data) {
    body = <ErrorState message={feed.error.message} onRetry={feed.reload} />;
  } else if (!data || (data.featured.length === 0 && data.trending.length === 0)) {
    body = (
      <EmptyState
        icon="book-outline"
        title="No stories yet"
        message="New stories will show up here as creators publish them."
        actionLabel="Refresh"
        onAction={feed.reload}
      />
    );
  } else {
    body = (
      <>
        {feed.error ? <ErrorState compact message={feed.error.message} onRetry={feed.reload} /> : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hscroll}
        >
          {data.featured.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              variant="featured"
              onPress={openStory}
              saved={isSaved(story.id)}
              onToggleSave={toggleSaved}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Trending now" actionLabel="See all" onAction={() => navigation.navigate('Discover')} />
        {data.trending.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            variant="compact"
            onPress={openStory}
            saved={isSaved(story.id)}
            onToggleSave={toggleSaved}
          />
        ))}

        <SectionHeader title="Creators to follow" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hscroll}
        >
          {data.creators.map((creator) => (
            <CreatorAvatar
              key={creator.id}
              creator={creator}
              size={62}
              showName
              onPress={() => openCreator(creator)}
              style={styles.avatarGap}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Fresh this week" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hscroll}
        >
          {data.fresh.map((story) => (
            <StoryCard key={story.id} story={story} variant="tile" onPress={openStory} />
          ))}
        </ScrollView>
      </>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={feed.refreshing}
            onRefresh={feed.refresh}
            tintColor={colors.violet}
            colors={[colors.violet]}
          />
        }
      >
        <Header
          eyebrow={greeting()}
          title={`Welcome back, ${firstName}`}
          subtitle="Pick up a story or find your next obsession."
          right={
            <IconButton
              name="notifications-outline"
              label="Notifications"
              onPress={() =>
                showNotice('Notifications', 'Activity from creators you follow will appear here in a later phase.', 'notifications-outline')
              }
            />
          }
        />
        {body}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  hscroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  avatarGap: { marginRight: spacing.sm },
  bottomSpace: { height: spacing.lg },
});
