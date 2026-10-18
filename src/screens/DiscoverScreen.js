import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Chip from '../components/Chip';
import SectionHeader from '../components/SectionHeader';
import StoryCard from '../components/StoryCard';
import CreatorAvatar from '../components/CreatorAvatar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import useAsync from '../hooks/useAsync';
import { fetchCreators, searchStories } from '../services/storyService';
import { GENRES } from '../data/stories';
import { useLibrary } from '../context/LibraryContext';
import { useNotice } from '../context/NoticeContext';
import { colors, spacing } from '../theme/theme';

export default function DiscoverScreen() {
  const { showNotice } = useNotice();
  const { isSaved, toggleSaved } = useLibrary();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [genre, setGenre] = useState('All');

  // Debounce typing so we don't "fetch" on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useAsync(() => searchStories({ query: debouncedQuery, genre }), [debouncedQuery, genre]);
  const creators = useAsync(fetchCreators, []);

  const isFiltering = debouncedQuery.length > 0 || genre !== 'All';
  const clearFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setGenre('All');
  };

  const openStory = (story) =>
    showNotice(
      story.title,
      'The full story reader arrives in a later phase. For now, save it to your Library to find it again.',
      'book-outline'
    );

  const refreshAll = () => {
    results.refresh();
    creators.refresh();
  };

  let resultsBody;
  if (results.loading && !results.data) {
    resultsBody = <LoadingState label={'Searching…'} />;
  } else if (results.error && !results.data) {
    resultsBody = <ErrorState message={results.error.message} onRetry={results.reload} />;
  } else if (results.data && results.data.length === 0) {
    resultsBody = (
      <EmptyState
        icon="search-outline"
        title="No stories found"
        message="Try a different word, or browse another genre."
        actionLabel="Clear filters"
        onAction={clearFilters}
      />
    );
  } else if (results.data) {
    resultsBody = (
      <>
        {results.error ? <ErrorState compact message={results.error.message} onRetry={results.reload} /> : null}
        {results.data.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            variant="compact"
            onPress={openStory}
            saved={isSaved(story.id)}
            onToggleSave={toggleSaved}
          />
        ))}
      </>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={results.refreshing || creators.refreshing}
            onRefresh={refreshAll}
            tintColor={colors.violet}
            colors={[colors.violet]}
          />
        }
      >
        <Header title="Discover" subtitle="Find stories, genres and creators you'll love." />
        <SearchBar value={query} onChangeText={setQuery} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {GENRES.map((g) => (
            <Chip key={g} label={g} selected={g === genre} onPress={() => setGenre(g)} />
          ))}
        </ScrollView>

        {!isFiltering && creators.data ? (
          <>
            <SectionHeader title="Top creators" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hscroll}
            >
              {creators.data.map((creator) => (
                <CreatorAvatar
                  key={creator.id}
                  creator={creator}
                  size={58}
                  showName
                  onPress={() =>
                    showNotice(creator.name, 'Creator profile pages arrive in a later phase.', 'person-outline')
                  }
                  style={styles.avatarGap}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionHeader title={isFiltering ? 'Results' : 'All stories'} />
        {results.loading && results.data ? (
          <View style={styles.inlineSpinner}>
            <ActivityIndicator color={colors.violet} />
          </View>
        ) : null}
        {resultsBody}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  chips: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  hscroll: { paddingHorizontal: spacing.xl },
  avatarGap: { marginRight: spacing.sm },
  inlineSpinner: { alignItems: 'center', paddingBottom: spacing.md },
});
